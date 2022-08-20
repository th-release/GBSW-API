import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { tokenCheck, decodeToken, TokenData, grantTypeChecker, hash, encodeToken, getRandom } from 'util/auth';
import db from 'util/database';
@Injectable()
export class AuthService {
  async getIdent(req: Request, res: Response) {
    const { client_id, client_secret, redirect_uri, grant_type, code } = req.body;
    if (!tokenCheck(code)) 
      return res.status(400).send({
        success: false,
        msg: "올바른 유저의 정보가 아닙니다."
      })
    const decode = decodeToken(code) as unknown as TokenData
    try {
      const [client] = await db.select('*').from('auth_clients').where({ client_id, secret: client_secret, redirect_uri }).limit(1)
      if (!client)
        return res.status(400).send({
          success: false,
          msg: "쿼리에 맞는 클라이언트를 찾을 수 없습니다. 서비스가 변경되었거나 삭제되었을 가능성이 높습니다."
        })
      const [user] = await db.select('*').from('auth').where({ userHash: hash(decode.id+decode.name+decode.gender+decode.phone) }).limit(1)
      if (!user)
        return res.status(400).send({
          success: false,
          msg: "올바른 유저의 정보가 아닙니다."
        })
      
      if (!grantTypeChecker(grant_type))
        return res.status(400).send({
          success: false,
          msg: "요청한 `grant_type`은 지원하지 않는 타입입니다."
        })
      
        return res.status(200).send({
          success: true,
          msg: "",
          user: {
            id: user.id,
            student_ID: user.student_ID,
            schoolClass: user.schoolClass,
            grade: user.grade,
            class: user.class,
            class_number: user.number,
            room_number: user.room,
            name: user.name,
            gender: user.gender,
            floor: user.floor,
            userHash: user.userHash,
            status: user.status
          }
        })
    } catch(e) {
      return res.status(500).send({
        success: false,
        msg: "서버에 오류가 발생하여 요청을 수행할 수 없습니다."
      })
    }
  }

  async login(req: Request, res: Response) {
    const { id, password } = req.body;
    try {
      const [user] = await db.select('*').from('auth').where({ id }).limit(1);
      if (!user) 
        return res.status(400).send({
          success: false,
          msg: "사용자를 찾을 수 없습니다."
        })
      
      if (user.password !== hash(password + user.salt))
        return res.status(400).send({
          success: false,
          msg: "비밀번호가 일치하지 않습니다."
        })
      else {
        const token = encodeToken({
          id: user.id,
          hash: user.userHash,
          schoolClass: user.schoolClass,
          name: user.name,
          gender: user.gender,
          student_ID: user.schoolClass === 1 ? `${user.grade}${user.userClass}${user.number.length === 1 ? '0' + user.number : user.number}` : "", 
          grade: user.schoolClass === 1 ? user.grade : 0,
          class: user.schoolClass === 1 ? user.userClass : 0,
          number: user.schoolClass === 1 ? user.number : 0,
          room: user.schoolClass === 1 ? user.room : 0,
          phone: user.phone,
          status: user.status,  
        })
        return res.status(200).send({
          success: true,
          msg: "성공적으로 요청이 완료되었습니다.",
          token
        })
        
      }
    } catch(e) {
      return res.status(500).send({
        success: false,
        msg: "서버에 오류가 발생하여 요청을 수행할 수 없습니다."
      })
    }
  }

  async signup(req: Request, res: Response) {
    const { 
      id, password, 
      name, phone, 
      gender, schoolClass, 
      grade, userClass, 
      number, room, 
      floor 
    } = req.body;
    if (gender === 0 || gender > 2) return res.status(400).send({ success: false, msg:"성별을 선택해주세요" });
    if (schoolClass === 0 || schoolClass > 2) return res.status(400).send({ success: false, msg:"학생, 교직원 둘 중 하나를 선택해주세요." });
    else if (schoolClass === 1) {
      if (!grade) return res.status(400).send({ success: false, msg: "학년을 입력해주세요." });
      if (/[~!@#\#$%<>^&*]/.test(grade) || /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(grade) || /[a-zA-Z]/.test(grade)) return res.status(400).send({ success: false, msg: "올바른 학년을 입력해주세요." });
      if (!userClass) return res.status(400).send({ success: false, msg: "반을 입력해주세요." });
      if (/[~!@#\#$%<>^&*]/.test(userClass) || /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(userClass) || /[a-zA-Z]/.test(userClass)) return res.status(400).send({ success: false, msg: "올바른 반 번호를 입력해주세요." });
      if (!number) return res.status(400).send({ success: false, msg: "반의 번호를 입력해주세요." });
      if (/[~!@#\#$%<>^&*]/.test(number) || /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(number) || /[a-zA-Z]/.test(number)) return res.status(400).send({ success: false, msg: "올바른 반의 번호를 입력해주세요." });
      if (!room) return res.status(400).send({ success: false, msg:"기숙사 방 번호를 입력해주세요." });
      if (/[~!@#\#$%<>^&*]/.test(room) || /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(room) || /[a-zA-Z]/.test(room)) return res.status(400).send({ success: false, msg: "올바른 기숙사 호실번호를 입력해주세요." });
    }
    if (!id || !password) return res.status(400).send({ success: false, msg:"아이디 또는 비밀번호를 입력해주세요." });
    if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(id)) return res.status(400).send({ success: false, msg:"아이디에 한글이 포함될 수 없습니다." });
    if (/[~!@#\#$%<>^&*]/.test(id)) return res.status(400).send({ success: false, msg:"아이디에 특수문자가 포함될 수 없습니다." });
    if (id.length > 24) return res.status(400).send({ success: false, msg:"아이디는 24자 이하이어야 합니다." });
    if (name.length < 2) return res.status(400).send({ success: false, msg: "이름을 입력해주세요." });
    if (/[0-9]/.test(name) || /[~!@#\#$%<>^&*]/.test(name)) return res.status(400).send({ success: false, msg: "이름에 특수문자나 숫자를 입력할 수 없습니다." });
    if (name.length > 5) return res.status(400).send({ success: false, msg: "이름은 5자 이하이어야 합니다." });
    if (phone.length !== 13) return res.status(400).send({ success: false, msg:"전화번호는 총 13자 이상이어야 합니다.\n예) 010-1234-5678"});
    if (/[~!@#\#$%<>^&*]/.test(phone)) return res.status(400).send({ success: false, msg:"전화번호에 특수문자를 입력할 수 없습니다." });

    const salt = getRandom("all", 32);
    const [user] = await db.select('*').from('auth').where({ id }).orWhere({ phone }).andWhere({ grade, class: userClass, number }).limit(1)
    if (user) return res.status(400).send({ success: false, msg: "아이디가 이미 존재합니다."})
    else {
      await db.insert({
        id,
        userHash: hash(id+name+gender+phone),
        schoolClass,
        student_ID: schoolClass === 1 ? `${grade}${userClass}${number.length === 1 ? '0' + number : number}` : "",
        password: hash(password + salt),
        salt,
        name,
        gender,
        grade,
        class: userClass,
        number,
        room,
        floor,
        phone,
        status: 0
      }).into('auth')
      return res.status(200).send({
        success: true,
        msg: "회원가입 요청이 정상적으로 처리 되었습니다."
      })
    }
  }
}
