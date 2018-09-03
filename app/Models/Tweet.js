'use strict'

const Model = use('Model')

class Tweet extends Model {
  user () {
    return this.belongsTo('App/Models/User')
  }

  replies () {
    return this.hasMany('App/Models/Reply')
  }

  // 收藏 / 点赞
  favorites () {
    return this.belongsTo('App/Models/Favorite')
  }
}

module.exports = Tweet
