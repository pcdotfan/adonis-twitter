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
  Route.group(() => {
    Route.get('me', 'UserController.me')
    Route.put('update_profile', 'UserController.updateProfile')
    Route.get('profile', 'UserController.profile')
    Route.get('change_password', 'UserController.changePassword')
  }).prefix('account').middleware(['auth:jwt'])
}).prefix('api')

Route.any('*', 'NuxtController.render')
