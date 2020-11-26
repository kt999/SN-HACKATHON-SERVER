const router = require("express").Router();
const controller = require('../controllers/api');

// 회원가입
router.post("/user", controller.signUp);

// 대화 리스트 조회
// 대화 입력

// 돌보미 일정 조회
router.get("/elder/calendar", controller.calendarElderDetail);

// 돌보미 연락하기
router.post("/elder/contact", controller.elderContactAdd);

//위치 업데이트 하기
router.post("/elder/location", controller.elderLocationAdd);






// 방문일정 리스트 조회
router.get("/manager/calendar", controller.calendarList);

// 방문일정 상세 조회 -> 일단 스킵

// 방문일정 등록
router.post("/manager/calendar", controller.calendarAdd);

// 어르신 상태 리스트 조회
router.get("/manager/state", controller.stateList);


// 어르신 위치 리스트 조회
router.get("/manager/location", controller.locationList);



module.exports = router;

