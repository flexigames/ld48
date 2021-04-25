import firebase from 'firebase'
import {sortBy} from 'lodash'

firebase.initializeApp({
  apiKey: 'AIzaSyCx7F0g068LG0QF1oPVQfvQqcs2aWFkkHw',
  authDomain: 'ld48-db074.firebaseapp.com',
  databaseURL:
    'https://ld48-db074-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'ld48-db074',
  storageBucket: 'ld48-db074.appspot.com',
  messagingSenderId: '131189706731',
  appId: '1:131189706731:web:cf03f6f903343cb7e753ae'
})

const database = firebase.database()

export function addHighscore(score: number) {
  database.ref('highscores').push().set({score})
}

export async function getHighscores(): Promise<{score: number}[]> {
  const snapshot = await database.ref('highscores').get()
  const highscores = Object.values(snapshot.val())
  return sortBy(highscores, ({score}) => -score).slice(0, 10) as {
    score: number
  }[]
}
