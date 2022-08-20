import { Injectable } from '@nestjs/common';
import e, { Request, Response } from 'express';
import { tokenCheck } from 'util/auth';

import db from 'util/database';

@Injectable()
export class LaundryService {
  async userViewCommand(req: Request, res: Response) {
    const { auth_token } = req.cookies;
    const check = await tokenCheck(auth_token!);
    if (check.user.status === 0)
      return res.status(401).send({
        success: false,
        msg: "아직 승인되지 않은 계정입니다.\n관리자에게 문의 해주세요."
      })
    else {
      if(check.user.schoolClass !== 2) {
        if (check.user.status === 1) {
          const items = await db.select('*').from('items').where({ status: 1 }).orderBy('sort', 'asc')
          const washer = await db.select('*').from('Laundry').where({ floor: check.user.floor, gender: check.user.gender, type: 1 })
          const dryer = await db.select('*').from('Laundry').where({ floor: check.user.floor, gender: check.user.gender, type: 2 })
          return res.status(200).send({
            Status: true,
            items,
            token: check.token,
            user_Status: check.user.status,
            washer,
            dryer,
          })
        } else {
          const items = await db.select('*').from('items').orderBy('sort', 'asc')
          const washer = await db.select('*').from('Laundry').where({ floor: check.user.floor, gender: check.user.gender, type: 1 })
          const dryer = await db.select('*').from('Laundry').where({ floor: check.user.floor, gender: check.user.gender, type: 2 })
          return res.status(200).send({
            Status: true,
            items,
            token: check.token,
            user_Status: check.user.status,
            washer,
            dryer,
          })
        }
      } else return res.status(401).send({
        success: false,
        token: check.token,
        msg: '선생님 계정은 admin Panel에서\n정보를 확인하실 수 있습니다.',
        userStatus: check.user.status
      }) 
    }
  }

  async userUpdateCommand(req: Request, res: Response) {
    const { auth_token } = req.cookies;
    const { num, type } = req.body;
    const check = await tokenCheck(auth_token!);
    if (check.user.status === 0)
      return res.status(401).send({
        success: false,
        msg: "아직 승인되지 않은 계정입니다.\n관리자에게 문의 해주세요."
      })
    else {
      if(check.user.schoolClass !== 2) {
        const [machine] = await db.select('*').from('Laundry').where({ floor: check.user.floor, gender: check.user.gender, num, type }).limit(1)
        if (!machine || machine.active === 2 || machine.student_ID !== check.user.student_ID) return res.status(400).send({
          success: false,
          msg: "해당하는 기기는 변경을 할 수 없습니다."
        })
        else {
          if (machine.active === 1) {
            await db.update({ active: 0, room: 0, student_ID: 0, name: 0, time: 0, LastName: machine.name, LastStudentID: machine.student_ID }).where({ floor: check.user.floor, gender: check.user.gender, num, type }).limit(1)
            return res.status(200).send({
              success: true,
              msg: "기기 사용을 중지 했습니다."
            })
          } else if (machine.active === 0) {
            await db.update({ active: 1, room: check.user.room, student_ID: check.user.student_ID, name: check.user.name, time: Date.now() }).where({ floor: check.user.floor, gender: check.user.gender, num, type }).limit(1)
            return res.status(200).send({
              success: true,
              msg: "기기 사용을 시작 했습니다."
            })
          } else {
            return res.status(400).send({
              success: false,
              msg: "잘못된 요청입니다."
            })
          }
        }
      } else return res.status(401).send({
        success: false,
        msg: '선생님 계정은 admin Panel에서\n정보를 확인하실 수 있습니다.',
      }) 
    }
  }

  async adminViewCommand(req: Request, res: Response) {
    const { auth_token } = req.cookies;
    const { command } = req.query;

    const items = await db.select('*').from('items_admin').orderBy('sort', 'asc').where({ status: 1 })
    const floors = await db.select('*').from('Laundry_floor').orderBy('floor', 'asc').orderBy('gender', 'asc')

    const check = await tokenCheck(auth_token!);
    if (check.user.status !== 2) 
      return res.status(401).send({
        Status: false,
        msg: "아직 승인되지 않은 계정입니다.\n관리자에게 문의 주세요."
      })
    
    if (command === "floor") 
      return res.status(200).send({
        success: true,
        token: check.token,
        user_Status: check.user.status,
        items,
        floors
      })
    else if (command === "machine") {
      const { floor, gender } = req.query
      if (!floor || !gender) 
        return res.status(400).send({
          Status: false,
          msg: "잘못된 요청입니다."
        })
      
      const washer = await db.select('*').from('Laundry').where({ floor, gender, type: 1 })
      const dryer = await db.select('*').from('Laundry').where({ floor, gender, type: 2 })
      return res.status(200).send({
        success: true,
        token: check.token,
        user_Status: check.user.status,
        items,
        washer,
        dryer
      })
    } else {
      return res.status(400).send({
        Status: false,
        msg: "잘못된 요청입니다."
      })
    }
  }

  async adminCreateCommand(req: Request, res: Response) {
    const { auth_token } = req.cookies;
    const { command } = req.query;

    const check = await tokenCheck(auth_token!);
    if (check.user.status !== 2) 
      return res.status(401).send({
        Status: false,
        msg: "아직 승인되지 않은 계정입니다.\n관리자에게 문의 주세요."
      })
    
    if (command === "floor") {
      const { floor, gender } = req.body
      if (!floor) 
        return res.status(400).send({
          Status: false,
          msg: "층 수를 적어주세요."
        })
      if (gender === 0) 
        return res.status(400).send({
          Status: false,
          msg: "성별을 선택해주세요."
        })
      const [item] = await db.select('*').from('Laundry_floor').where({ floor, gender })
      if (item)
        return res.status(400).send({
          Status: false,
          msg: "이미 존재하는 데이터 값 입니다."
        })
      else {
        await db.insert({ floor, gender, creater: check.user.name }).into('Laundry_floor')
        return res.status(200).send({
          Status: true,
          msg: "요청이 정상적으로 처리되었습니다."
        })
      }
    } else if (command === "machine") {
      const { floor, gender, machine_Type } = req.body
      if (!floor || !gender)
        return res.status(400).send({
          Status: false,
          msg: "잘못된 요청입니다."
        })
      const [last_machine] = await db.select('*').from('Laundry').where({ floor, gender, type: machine_Type }).orderBy('num', 'desc').limit(1)
      const [information] = await db.select('*').from('Laundry_floor').where({ floor, gender }).limit(1)
      
      await db.insert({ floor, gender, type: last_machine, num: last_machine ? last_machine.num + 1 : 1 }).into('Laundry')
      await db.update({ washer: last_machine === 1 ? information.washer + 1 : information.washer, dryer: last_machine === 1 ? information.dryer + 1 : information.dryer }).from('Laundry_floor').where({ floor: information.floor, gender: information.gender })
      
      return res.status(200).send({
        Status: true,
        msg: "요청이 정상적으로 처리되었습니다."
      })
    } else {
      return res.status(400).send({
        Status: false,
        msg: "잘못된 요청입니다."
      })
    }
  }

  async adminUpdateCommand(req: Request, res: Response) {
    const { auth_token } = req.cookies;
    const { command } = req.query;
    
    const { status, gender, floor } = req.body

    const check = await tokenCheck(auth_token!);
    if (check.user.status !== 2) 
      return res.status(401).send({
        Status: false,
        msg: "아직 승인되지 않은 계정입니다.\n관리자에게 문의 주세요."
      })
    
    if (command === "machine") {
      const { type, num } = req.body

      const [machine] = await db.select('*').from('Laundry').where({ gender, floor, type, num })

      if (!machine)
        return res.status(400).send({
          success: false,
          msg: "해당하는 기기가 존재하지 않습니다."
        })
      
      if (machine.active === 1 && status === 0)
        return res.status(400).send({
          success: false,
          msg: "이미 사용중인 기기를 바꿀 수 없습니다."
        })

      if (status === 1 || !status || status > 2) 
        return res.status(400).send({
          success: false,
          msg: "서비스 상태를 선택해주세요."
        })
      else {
        if (!type)
          return res.status(400).send({
            success: false,
            msg: "세탁기/건조기 종류를 선택해주세요."
          })

        if (!num)
          return res.status(400).send({
            success: false,
            msg: "기기 번호를 입력해주세요."
          })

        await db.update({ active: status }).from('Laundry').where({ gender, floor, type, num })
        
        return res.status(200).send({
          Status: true,
          msg: "요청이 정상적으로 처리되었습니다."
        })
      }
    } else {
      return res.status(400).send({
        Status: false,
        msg: "잘못된 요청입니다."
      })
    }
  }
}
