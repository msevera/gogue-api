PROJECT=$1
CLUSTER=$2
ENV=$3
SHA=$4

gcloud container clusters get-credentials cluster-${CLUSTER}  --location=us-east4 --project=learnbud-d317a

kubectl apply -f k8s/namespace.yml

docker build -t us-docker.pkg.dev/learnbud-d317a/docker/api:latest -t us-docker.pkg.dev/learnbud-d317a/docker/api:${PROJECT}-${ENV}-${SHA} .
docker push us-docker.pkg.dev/learnbud-d317a/docker/api:latest
docker push us-docker.pkg.dev/learnbud-d317a/docker/api:${PROJECT}-${ENV}-${SHA}

while IFS="=" read line val || [ -n "$line" ]; do
  if [[ "$line" != "#"* && ${val//[$'\t\r\n']/} != $'' ]]; then
    loweredVal=${line,,}
    nospacesVal=${val//[$'\t\r\n']/}
    replacedVal=${loweredVal//_/-}
    kubectl delete secret api-$replacedVal -n=${PROJECT}
    kubectl create secret generic api-$replacedVal --from-literal API_$line="$nospacesVal" -n=${PROJECT}
  fi
done <.env

kubectl apply -f k8s/ssd-storage-class.yml
kubectl apply -f k8s/wildcard-certificate-issuer.yml
kubectl apply -f k8s/env/${ENV} -n=${PROJECT}
kubectl apply -f k8s/api-cluster-ip-service.yml -n=${PROJECT}
kubectl apply -f k8s/api-deployment.yml -n=${PROJECT}
kubectl apply -f k8s/redis-ssd-persistent-volume.yml -n=${PROJECT}
kubectl apply -f k8s/redis-statefulset.yml -n=${PROJECT}
kubectl apply -f k8s/redis-cluster-ip-service.yml -n=${PROJECT}

kubectl set image deployments/api-deployment api=us-docker.pkg.dev/learnbud-d317a/docker/api:${PROJECT}-${ENV}-${SHA} -n=${PROJECT}
kubectl exec statefulset/redis-statefulset -n=${PROJECT} -- sh -c "redis-cli --scan | grep -v ens: | xargs redis-cli del"
