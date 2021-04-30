import firebase from 'firebase'
import {sortBy} from 'lodash'
import {useEffect, useState} from 'react'

firebase.initializeApp({
  apiKey: 'AIzaSyDU9_NbK0O-F5jmd7YP9L5qkdB7hthZt_8',
  authDomain: 'ld-48-version-3.firebaseapp.com',
  databaseURL: 'https://ld-48-version-3-default-rtdb.firebaseio.com',
  projectId: 'ld-48-version-3',
  storageBucket: 'ld-48-version-3.appspot.com',
  messagingSenderId: '113010370424',
  appId: '1:113010370424:web:dcfcdfd96555075e388a8d'
})

const database = firebase.database()

export function addHighscore(score: number, name: string, playerId: string) {
  database.ref('highscores').push().set({score, name, playerId})
}

export function useHighscores() {
  const [highscores, setHighscores] = useState<Score[]>([])
  useEffect(() => {
    database.ref('highscores').on('value', (snapshot) => {
      const highscores = Object.values(snapshot.val())
      setHighscores(sortBy(highscores, ({score}) => -score) as Score[])
    })
  }, [])
  return highscores
}

export type Score = {
  score: number
  name?: string
  playerId: string
}
