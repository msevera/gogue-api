import { FIREBASE_APP } from '@app/common/constants/firebase.constants';
import { Inject, Injectable } from '@nestjs/common';
import { app } from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseService {
  constructor(@Inject(FIREBASE_APP) private firebaseApp: app.App) { }

  async getUser(idToken: string) {
    try {
      const auth = getAuth(this.firebaseApp);
      const decodedToken = await auth.verifyIdToken(idToken);
      const uid = decodedToken.uid;
      return await auth.getUser(uid);
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }
}
