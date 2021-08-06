import RedisService from '../session-store'
import { v4 } from 'uuid';

const getRandomInt = () => {
    return Math.floor(Math.random()*4);
}

const checkReRoll = (chanceToReRoll) => {
    const x = Math.random();
    if(x < chanceToReRoll) return false
    else return true
}

const checkWinCond = (items) => {
    if(items.block1 === items.block2 && items.block2 === items.block3 ) return true;
    else return false;
}

const generateRandomItems = () => {
    const items = {}
    items.block1 = getRandomInt(),
    items.block2 = getRandomInt(),
    items.block3 = getRandomInt();
    return items
}

const LogicforHigherCredits = (items, chanceToReRoll, getSession) => {
    return new Promise(async (resolve, reject) => {
        try {
            if(checkWinCond(items)){
                const isReRoll = checkReRoll(chanceToReRoll);
                if(isReRoll){
                    items = generateRandomItems();
                    if(checkWinCond(items)) getSession.credits += ((items.block1 + 1)*10 - 1)
                    else getSession.credits += - 1
                }
                else getSession.credits += - 1
            }
            else getSession.credits += - 1
            // update in redis
            await RedisService.set(`sessionId:${getSession.sessionId}`, JSON.stringify(getSession))
            const responseObject = {success: 'true', data: getSession, items}
            resolve(responseObject)
        } catch(err) {
            reject(err)
        }
    })
}

module.exports = {
    createSession: async (req, res, next) => {
        try{
            const sessionId = v4();
            const session = {
                sessionId: sessionId,
                credits: 10,
                state: 'start'
            };
            const storeSession = await RedisService.set(`sessionId:${sessionId}`, JSON.stringify(session))
            res.status(200).json({
                success: true,
                data: session
            })
        } catch(e) {
            res.status(500).json({
                success: false,
                message: e.message
            })
        }
    },

    startPlaying: async (req, res, next) => {
        try{
            let getSession = await RedisService.get(`sessionId:${req.params.id}`)
            let items = {block1: 0, block2: 0, block3: 0}
            if(getSession && getSession.credits > 0){
                const credits = getSession.credits;
                let response;
                items = generateRandomItems();
                getSession.state = 'play'
                if(getSession.credits < 40){
                    if(checkWinCond(items)) getSession.credits += ((items.block1 + 1)*10 - 1)
                    else getSession.credits += - 1
                    const storeSession = await RedisService.set(
                        `sessionId:${req.params.id}`, 
                        JSON.stringify(getSession)
                    )
                    if(storeSession)response = {success: true, data: getSession, items}
                }
                else if (getSession.credits >= 40 && getSession.credits <=60 ) {
                    response = await LogicforHigherCredits(items, 0.3, getSession)
                }
                else response = await LogicforHigherCredits(items, 0.6, getSession)
                if (getSession.credits < 0) throw new Error('Low Balance')
                if(response) res.status(200).json(response)
                else throw new Error('Some Error Occured while rolling the machine. Please Try Again!')
            }
            else throw new Error('Please pass a valid session id!')
        } catch(e){
            res.status(200).json({
                success: false,
                message: e.message
            })
        }
    },

    endSession: async (req, res, next) => {
        try{
            let getSession = await RedisService.get(`sessionId:${req.params.id}`)
            if(getSession) {
                if(getSession.state === 'end') throw new Error(`You don't have any existing session, Please start the session!`)
                const earnedCredits = getSession.credits
                getSession.credits = 0
                getSession.state = 'end'
                const storeSession = await RedisService.set(`sessionId:${req.params.id}`, JSON.stringify(getSession))
                if(storeSession){
                    res.status(200).json({
                        success: true,
                        earnedCredits 
                    })
                }
            }
            else throw new Error('Please pass a valid session id!')
        } catch(e) {
            res.status(200).json({
                success: false,
                message: e.message 
            })
        }
    }
}