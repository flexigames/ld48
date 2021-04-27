import firebase from 'firebase'
import {sortBy} from 'lodash'

firebase.initializeApp({
  apiKey: 'AIzaSyBalqEJgDi1d42Y3EsjxVuUEEPZcppWVbE',
  authDomain: 'ld-48-292a6.firebaseapp.com',
  projectId: 'ld-48-292a6',
  storageBucket: 'ld-48-292a6.appspot.com',
  messagingSenderId: '536667189817',
  appId: '1:536667189817:web:7e05f00af02cce6c4793e8',
  databaseURL: 'https://ld-48-292a6-default-rtdb.firebaseio.com/'
})

const database = firebase.database()

export function addHighscore(score: number, name: string) {
  database.ref('highscores').push().set({score, name})
}

export async function getHighscores(): Promise<Score[]> {
  const snapshot = await database.ref('highscores').get()
  const highscores = Object.values(snapshot.val())
  return sortBy(highscores, ({score}) => -score).slice(0, 9) as Score[]
}

export type Score = {
  score: number
  name?: string
}
