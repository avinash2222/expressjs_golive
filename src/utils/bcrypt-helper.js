import bcrypt from 'bcrypt'

const generateHash = async (payload) => {
  let salt = bcrypt.genSaltSync(parseInt(process.env.SALT_WORK_FACTOR))
  return await bcrypt.hash(payload, salt)
}

export { generateHash }
