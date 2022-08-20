import jwt from 'jsonwebtoken'

import sha3 from 'sha3'

import db from './database'

export const SECRET = "fea28fd1e2b7e9fc8e8f315b77b95cbe2ef14164119952a27375fa156e930a46"

export interface TokenData {
  id: string,
  hash: string,
  schoolClass: number,
  name: string,
  gender: number,
  student_ID: string, 
  grade: string,
  class: string,
  number: string,
  room: string,
  phone: string,
  status: number,
}

export const verifyCheck = (token: string) => {
  var token_status = false;
  var verify_status = false;
  if (token)
    token_status = true;

  jwt.verify(token, SECRET, (error, decoded) => {
    if (error) 
      verify_status = false;
    else 
      verify_status = true;
  })

  return {token_status, verify_status}
}

export const encodeToken = (item: any) => {
  const token = jwt.sign(item, SECRET, { expiresIn: '8h' })
  return token
}

export const decodeToken = (token: string) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET, (error, decoded) => {
      if(error) reject(error);
      resolve(decoded);
    });
  })
}

export const tokenCheck = async (token: string) => {
  if (!token) 
    return {
      Status: false,
      msg: "로그인 필요한 시스템 입니다."
    }
  const check1 = verifyCheck(token)
  if (!check1.token_status || !check1.verify_status)
    return {
      Status: false,
      msg: "로그인 필요한 시스템 입니다."
    }
  const check2 = await decodeToken(token) as any
  if (!check2)
    return {
      Status: false,
      msg: "로그인 필요한 시스템 입니다."
    }
  const [user] = await db.select('*').from('auth').where({ 
    id: check2.id,
    student_ID: check2.Student, 
    schoolClass: check2.schoolClass,
    name: check2.name,
    gender: check2.gender,
    grade: check2.grade,
    class: check2.class,
    number: check2.number,
    room: check2.room
   }).limit(1)
  if (!user)
    return {
      Status: false,
      msg: "로그인 필요한 시스템 입니다."
    }
  return {
    Status: true,
    token: check2,
    user,
    user_Status: user.status
  }

}

export const getRandom = (type_: string, length: number) => { // ranStr
  let result = "";
  const type = type_.toLowerCase();
  length = length ? length : 32;
  let characters = "0123456789";
  if (type === 'number' || type === 'numbers') {
    characters = "0123456789";
    for (let i = 0; i < length; i++) {
      result += characters[Math.floor(Math.random() * characters.length)];
    }
    return result;
  } else if (type === 'alphabet' || type === 'alphabets') { 
    characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < length; i++) {
      result += characters[Math.floor(Math.random() * characters.length)];
    }
    return result;
  } else if (type === 'alphanumeric' || type === 'all') {
    characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < length; i++) {
      result += characters[Math.floor(Math.random() * characters.length)];
    }
    return result;
  } else {
    characters = type;
    for (let i = 0; i < length; i++) {
      result += characters[Math.floor(Math.random() * characters.length)];
    }
    return result;
  }
}

export const hash = (text: string) => {
  const hasher = new sha3(512)
  hasher.update(text)
  return hasher.digest('hex')
}

export const grantTypeChecker = (type: string) => {
  if (type === 'authorization_code')
    return true
  else
    return false
}