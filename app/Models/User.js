'use strict'

const Model = use('Model')

class User extends Model {
  static boot () {
    super.boot()

    /**
     * A hook to bash the user password before saving
     * it to the database.
     *
     * Look at `app/Models/Hooks/User.js` file to
     * check the hashPassword method
     */
    this.addHook('beforeSave', 'User.hashPassword')
  }

  /**
   * A relationship on tokens is required for auth to
   * work. Since features like `refreshTokens` or
   * `rememberToken` will be saved inside the
   * tokens table.
   *
   * @method tokens
   *
   * @return {Object}
   */
  tokens () {
    return this.hasMany('App/Models/Token')
  }

  tweets () {
    return this.hasMany('App/Models/Tweet')
  }

  // 粉丝
  followers () {
    return this.belongsToMany(
        'App/Models/User',
        'user_id',
        'follower_id'
    ).pivotTable('followers')
  }

  // 关注
  following () {
    return this.belongsToMany(
        'App/Models/User',
        'follower_id',
        'user_id'
    ).pivotTable('followers')
  }

  // 收藏 / 点赞
  favorites () {
    return this.hasMany('App/Models/Favorites')
  }

  replies () {
    return this.hasMany('App/Models/Reply')
  }
}

module.exports = User
