'use strict'

const User = use('App/Models/User')
const Tweet = use('App/Models/Tweet')

const Hash = use('Hash')

class UserController {
  async register ({ request, auth, response }) {
    const userData = request.only(['name', 'username', 'email', 'password'])

    try {
      const user = await User.create(userData)
      const token = await auth.generate(user)

      return response.send({
        status: 'success',
        data: token
      })
    } catch (error) {
      return response.status(400).send({
        status: 'error',
        message: '注册失败'
      })
    }
  }

  async login ({ request, auth, response }) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const token = await auth.attempt(email, password)

      return response.send({
        status: 'success',
        data: token
      })
    } catch (error) {
      return response.status(400).send({
        status: 'error',
        message: '登录失败'
      })
    }
  }

  async updateProfile ({ request, auth, response }) {
    try {
      const user = auth.current.user
      const { username, email, location, bio, website_url } = request.only(['username', 'email', 'location', 'bio', 'website_url'])
      await user.update({ username, email, location, bio, website_url })
      await user.save()

      return response.json({
        status: 'success',
        data: user
      })
    } catch (error) {
      return response.status(400).json({
        status: 'error',
        error: '操作失败'
      })
    }
  }

  async me ({ auth, response }) {
    const user = await User.find(auth.current.user.id)
                            .with('tweets', builder => {
                              builder.with('user')
                              builder.with('favorites')
                              builder.with('replies')
                            })
                            .with('following')
                            .with('followers')
                            .with('favorites')
                            .with('favorites.tweet', builder => {
                              builder.with('user')
                              builder.with('favorites')
                              builder.with('replies')
                            })
                            .firstOrFail()
    return response.json({
      status: 'success',
      data: user
    })
  }

  async timeline ({ auth, response }) {
    const user = await User.find(auth.current.user.id)

    // get an array of IDs of the user's followers
    const followersIds = await user.following().ids()

    // add the user's ID also to the array
    followersIds.push(user.id)

    const tweets = await Tweet.whereIn('user_id', followersIds)
        .with('user')
        .with('favorites')
        .with('replies')
        .fetch()

    return response.json({
      status: 'success',
      data: tweets
    })
  }

  async changePassword ({ auth, request, response }) {
    const user = auth.current.user
    const { password, newPassword } = request.only(['password', 'new_password'])

    const verifyPassword = await Hash.verify(
            password,
            user.password
        )

    if (!verifyPassword) {
      return response.status(400).send({
        status: 'error',
        error: '原密码输入错误'
      })
    }

    user.password = await Hash.make(newPassword)
    await user.save()

    return response.send({
      status: 'success',
      message: '更改密码成功'
    })
  }

  async showProfile ({ params, response }) {
    try {
      const user = await User.where('username', params.username)
                          .with('tweets', builder => {
                            builder.with('user')
                            builder.with('favorites')
                            builder.with('replies')
                          })
                          .with('following')
                          .with('followers')
                          .with('favorites')
                          .with('favorites.tweet', builder => {
                            builder.with('user')
                            builder.with('favorites')
                            builder.with('replies')
                          })
                          .firstOrFail()
      return response.json({
        status: 'success',
        data: user
      })
    } catch (error) {
      return response.status(404).json({
        status: 'error',
        error: '未找到用户'
      })
    }
  }

  async followables ({ auth, response }) {
    const user = auth.current.user
    const followedUserIds = await user.following().ids()

    const followables = await User.whereNot('id', user.id)
                                .whereNotIn('id', followedUserIds)
                                .pick(3)

    return response.send({
      status: 'success',
      data: followables
    })
  }

  async follow ({ request, auth, response }) {
    const user = auth.current.user
    await user.following().attach(request.input('user_id'))

    return response.send({
      status: 'success'
    })
  }

  async unfollow ({ request, auth, response }) {
    const user = auth.current.user
    await user.following().detach(request.input('user_id'))

    return response.send({
      status: 'success'
    })
  }
}

module.exports = UserController
