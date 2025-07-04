import { customAlphabet } from 'nanoid'

const nolookalikes = '346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz'

export const nanoid = customAlphabet(nolookalikes, 16)

export const randomKey = customAlphabet(nolookalikes, 24)
