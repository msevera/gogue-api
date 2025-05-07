import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import * as admin from 'firebase-admin';
import { credential } from 'firebase-admin';
import applicationDefault = credential.applicationDefault;
import { FIREBASE_APP } from '@app/common/constants/firebase.constants';

@Module({
  imports: [],
  providers: [
    {
      provide: FIREBASE_APP,
      inject: [],
      useFactory: () => {
        return admin.initializeApp({
          credential: applicationDefault(),
        });
      },
    },
    FirebaseService,
  ],
  exports: [FIREBASE_APP, FirebaseService],
})
export class FirebaseModule {}
