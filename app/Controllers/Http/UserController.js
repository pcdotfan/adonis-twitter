'use strict'

const User = use('App/Models/User')
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
}

module.exports = UserController
