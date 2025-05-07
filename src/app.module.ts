import { Module, UnauthorizedException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { mongooseLeanVirtuals } from 'mongoose-lean-virtuals';
import { mongooseLeanGetters } from 'mongoose-lean-getters';
import mongooseLeanDefaults from 'mongoose-lean-defaults';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from './cache/cache.module';
import { DataLoaderFactory } from './data-loader/data-loader.factory';
import { EmbeddingsModule } from './embeddings/embeddings.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { DataLoaderModule } from './data-loader/data-loader.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ContextIdFactory } from '@nestjs/core';
import { AggregateByWorkspaceContextIdStrategy } from '@app/common/strategies/aggregate-by-workspace.strategy';
import { FirebaseService } from './firebase/firebase.service';
import { UsersService } from './users/users.service';
import { PubSubModule } from './pubsub/pubsub.module';
import { NotificationsModule } from './notifications/notifications.module';
import { LectureAgentModule } from './lecture-agent/lecture-agent.module';
import { LecturesModule } from './lectures/lectures.module';
import { NotesModule } from './notes/notes.module';
import { NoteAgentModule } from './note-agent/note-agent.module';

ContextIdFactory.apply(new AggregateByWorkspaceContextIdStrategy());

@Module({
  imports: [
    UsersModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [DataLoaderModule, FirebaseModule, UsersModule],
      inject: [DataLoaderFactory, FirebaseService, UsersService],
      useFactory: (
        dataLoadersRegistryFactory: DataLoaderFactory,
        firebaseService: FirebaseService,
        usersService: UsersService
      ) => {
        return {
          path: '/graphql',
          driver: ApolloDriver,
          autoSchemaFile: true,
          introspection: true,
          playground: false,
          plugins: [ApolloServerPluginLandingPageLocalDefault()],
          context: ({ req, res }) => {
            return {
              req,
              res,
              dataLoaders: dataLoadersRegistryFactory.create(),
            };
          },
          subscriptions: {
            'graphql-ws': {
              path: '/subscriptions',
              onConnect: async (context) => {
                const { connectionParams, extra } = context as { connectionParams: any, extra: any };
                const token = connectionParams.authToken;
                const tenantId = connectionParams.tenantId;
                if (!token || !tenantId) {
                  throw new UnauthorizedException('Invalid token or tenantId');
                }

                const firebaseUser = await firebaseService.getUser(token);
                const user = await usersService.findOneByUID(firebaseUser.uid, { throwErrorIfNotFound: false });
                if (tenantId) {
                  if (!user.workspaces.find((w) => w.workspaceId === tenantId)) {
                    throw new UnauthorizedException('Workspace not found');
                  }
                }

                // user validation will remain the same as in the example above
                // when using with graphql-ws, additional context value should be stored in the extra field
                extra.authContext = { user, workspaceId: tenantId };
              },             
            },
          },
        };
      },
    }),
    DataLoaderModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL'),
        connectionFactory: (connection) => {
          connection.plugin(mongooseLeanVirtuals); // Apply the plugin globally
          connection.plugin(mongooseLeanGetters); // Apply the plugin globally
          connection.plugin(mongooseLeanDefaults); // Apply the plugin globally
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    CacheModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          socket: {
            host: configService.getOrThrow('REDIS_HOST'),
            port: configService.getOrThrow('REDIS_PORT'),
            reconnectStrategy: () => 1000,
          },
          database: configService.getOrThrow('REDIS_DB'),
        };
      },
      inject: [ConfigService],
    }),
    FirebaseModule,
    AuthModule,  
    EmbeddingsModule,
    WorkspacesModule,
    PubSubModule,
    NotificationsModule,
    LectureAgentModule,
    LecturesModule,
    NotesModule,
    NoteAgentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
