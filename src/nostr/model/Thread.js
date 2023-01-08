export default class Thread {
  constructor(note) {
    this.note = note
    this.replies = []
  }

  id() {
    return this.note.id
  }

  addReply(note) {
    this.replies.push(note)
  }
}
