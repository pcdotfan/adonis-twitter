'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/guides/routing
|
*/

const Route = use('Route')

Route.group(() => {
  Route.post('register', 'UserController.register')
  Route.post('login', 'UserController.login')
  Route.get('me', 'UserController.me').middleware(['auth:jwt'])
  Route.get('timeline', 'UserController.timeline').middleware(['auth:jwt'])

  Route.put('account.update_profile', 'UserController.updateProfile').middleware(['auth:jwt'])
  Route.get('account.profile', 'UserController.profile').middleware(['auth:jwt'])
  Route.get('account.change_password', 'UserController.changePassword').middleware(['auth:jwt'])
  Route.get('account.followables', 'UserController.followables').middleware(['auth:jwt'])

  Route.post('follow.:id', 'UserController.follow').middleware(['auth:jwt'])
  Route.post('unfollow.:id', 'UserController.unfollow').middleware(['auth:jwt'])

  Route.get('tweets.:id', 'TweetsController.show')
  Route.post('tweet', 'TweetsController.tweet').middleware(['auth:jwt'])

  Route.get(':username', 'UserController.showProfile')
}).prefix('api')

Route.any('*', 'NuxtController.render')
