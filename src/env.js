let _env

const envs = ['prod', 'test']

export const setEnv = (env = 'prod') => {
    if (envs.includes(env)) {
        _env = env
    }
}

export const getEnv = () => {
    return _env
}
