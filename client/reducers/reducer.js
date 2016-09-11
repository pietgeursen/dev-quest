var initialState = require('./initialState')
var combineReducers = require('redux').combineReducers
var levelGrids = require('../levels/levelGrids')

function reducer (state = initialState, action) {

  var newState = Object.assign({}, state)
  var { tileGrid, enemies, player } = newState
  var playerX = player.position.x
  var playerY = player.position.y
  var nextTile

  var nextLevelFunc = function() {
    newState.currentLevel ++
    if (newState.currentLevel == 5){
      newState.display = "win"
      return newState
    }
    newState.tileGrid = levelGrids[newState.currentLevel-2]
    return newState
  }

  var isPlayerAdjacent = function(enemy) {
    var {x, y } = enemy.position
    return  (x == playerX+1 && y == playerY || x == playerX-1 && y == playerY || x == playerX && y == playerY-1 || x == playerX && y == playerY+1  )
  }

  switch(action.type){

    //these are the cases for player movement

    case 'PLAYER_MOVE':
        var { y, x} = action.payload
        nextTile = tileGrid[y][x]
        if (nextTile == 1 || nextTile == 2) {
          newState.player.position.x = x
          newState.player.position.y = y
        } else if (nextTile == 3) {
          nextLevelFunc()
        }
        return newState

    //these are the cases for the player attacking

    case 'PLAYER_ATTACK':
      var { loggedMessages } = newState
      var enemyX = action.payload.position.x
      var enemyY = action.payload.position.y

      var attackedEnemy = enemies.find(function(enemy){
        return enemy.position.x == enemyX && enemy.position.y == enemyY
      })

      attackedEnemy.health --
      newState.loggedMessages.push(action.payload.messages.playerAttacks)
      newState.loggedMessages = newState.loggedMessages.slice(0)
      if (attackedEnemy.health <= 0) {
        var enemyIndex = enemies.findIndex(function(enemy){
          return enemy.position.x == enemyX && enemy.position.y == enemyY
        })
        newState.enemies.splice(enemyIndex, 1)
        newState.loggedMessages.push(action.payload.messages.enemyDefeated)
        newState.loggedMessages = newState.loggedMessages.slice(0)
      }
      return newState

    //these are the cases for enemies attacking

    case 'ALL_ENEMIES_ACT':
      enemies.map(function(enemy){
        if(isPlayerAdjacent(enemy)){
               player.health--
          }
      })
      return newState

    //these are the cases for game running
    case 'START_GAME':
      newState.display = "game"
      return newState

    case 'WIN_GAME':
      newState.display = "win"
      return newState

    case 'LOSE_GAME':
      newState.display = "loss"
      return newState

    default:
      return state
  }
}

module.exports = reducer
