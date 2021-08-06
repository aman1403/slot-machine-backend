import Redis from 'ioredis';
const opts = {
    host: 'redis-10752.c8.us-east-1-2.ec2.cloud.redislabs.com',
    port: 10752,
    password: 'wHcFAvNy4dUuHDytzxXvDfQq3jNXUNGS'
}
const client = new Redis(opts);

const getValueFromCache = async(key) => {
    return new Promise((resolve, reject) => {
        client.get(key, (err, value) => {
            if(err) reject(err);
            let _value;
            try{
                _value = JSON.parse(value);
            } catch (e) {
                _value = value;
            }
            resolve(_value)
        })
    })
}

module.exports = {
    get: async (key) => {
        return await getValueFromCache(key).then(t => {
            return t;
        }).catch((err) => {
            console.log(err);
            return undefined;
        })
    },

    set: async (key, value) => {
        return new Promise(async (resolve, reject) => {
            try {
                await client.set(key, value)
                resolve({key, value})
            } catch(e) {
                reject(`Redis Reject err:`, e)
            }
        })
    }
}