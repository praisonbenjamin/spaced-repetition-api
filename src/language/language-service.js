const { LinkedList } = require('../utils/LinkedList')

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first()
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id })
  },

  getNextWord(db, language_id) {
    return db
      .from('word')
      .join('language', 'word.id','=','language.head')
      .select(
        'original',
        'language_id',
        'correct_count',
        'incorrect_count'
        )
        .where({ language_id })
  },

  populateLinkedList(arr, language) {
    let list = new LinkedList()

    let curr = arr.find(e => e.id === language.head)
    list.insertLast(curr)

    while (curr.next !== null) {
      curr = arr.find(e => e.id === curr.next)
      list.insertLast(curr)
    }
    return list
  },

  updateWords(db, list, langId, add) {
    return db.transaction(async trx => {
      return Promise.all([
        trx('language')
        .where({ id: langId })
        .update({
          total_score: add,
          head: list[0].id
        }),
        ...list.map((word, i) => {
          let next
          if(i + 1 >=list.length) {
            word.next = null
          } else {
            word.next = list[i + 1].id
          }
          return trx('word')
          .where({ id: word.id })
          .update({ ...word })
        })
      ])
    })
  }  
}

module.exports = LanguageService
