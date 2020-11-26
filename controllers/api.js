const { pool } = require('../config/database');
const { logger } = require('../config/winston');

const axios = require('axios');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const secret_config = require('../config/secret');

/// 공통 api
exports.signUp = async function (req, res) {
    const { name, type, phone } = req.body;

    if (!name || !type || !phone) return res.json({ isSuccess: false, code: 301, message: "모든내용을 입력해주세요." });

    try {
        const connection = await pool.getConnection(async conn => conn);
        try {

            const insertUserQuery = `
                INSERT INTO
                user(name, type, phone)
                VALUES (?, ?, ?);
                `;

            let insertUserParams = [name, type, phone];

            const row = await connection.query(insertUserQuery, insertUserParams);

            const insertId = row[0].insertId;

            connection.release();

            return res.json({
                insertId: insertId,
                isSuccess: true,
                code: 200,
                message: "회원가입 성공"
            });

        } catch (err) {
            connection.release();
            logger.error(`공통 - 회원가입 Query error\n: ${err.message}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    } catch (err) {
        logger.error(`공통 - 회원가입 DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

/// 어르신 api
exports.calendarElderDetail = async function (req, res) {

    const elderIdx = req.headers['idx'];
    if (!elderIdx) return res.json({ isSuccess: false, code: 302, message: "헤더를 입력해주세요." });


    try {
        const connection = await pool.getConnection(async conn => conn);
        try {

            const selectCalendarQuery = `
                    SELECT c.*
                    FROM
                    calendar as c
                    INNER JOIN
                    user as u
                    ON c.elder_idx = u.idx
                    WHERE elder_idx = ?
                    order by c.created_at desc
                    limit 1;
                `;

            const selectCalendarParams = [elderIdx];

            const [resultRows] = await connection.query(selectCalendarQuery, selectCalendarParams);

            if (resultRows.length == 0) {
                result = null;
            }
            else {
                result = resultRows[0];
            }

            connection.release();

            return res.json({
                result: result,
                isSuccess: true,
                code: 200,
                message: "돌보미 일정 조회 성공"
            });

        } catch (err) {
            connection.release();
            logger.error(`돌보미 - 방문일정 등록 Query error\n: ${err.message}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    } catch (err) {
        logger.error(`돌보미 - 방문일정 등록 DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

exports.elderContactAdd = async function (req, res) {

    const elderIdx = req.headers['idx'];
    if (!elderIdx) return res.json({ isSuccess: false, code: 302, message: "헤더를 입력해주세요." });

    const { state } = req.body;
    if (!state) return res.json({ isSuccess: false, code: 301, message: "모든내용을 입력해주세요." });



    try {
        const connection = await pool.getConnection(async conn => conn);
        try {

            const insertContactQuery = `
                INSERT INTO
                contact(elder_idx, state)
                VALUES (?, ?);
                `;

            let insertContactParams = [elderIdx, state];

            await connection.query(insertContactQuery, insertContactParams);

            connection.release();

            return res.json({
                isSuccess: true,
                code: 200,
                message: "돌보미 연락하기 성공"
            });

        } catch (err) {
            connection.release();
            logger.error(`돌보미 - 방문일정 등록 Query error\n: ${err.message}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    } catch (err) {
        logger.error(`돌보미 - 방문일정 등록 DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

exports.elderLocationAdd = async function (req, res) {

    const elderIdx = req.headers['idx'];
    if (!elderIdx) return res.json({ isSuccess: false, code: 302, message: "헤더를 입력해주세요." });

    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) return res.json({ isSuccess: false, code: 301, message: "모든내용을 입력해주세요." });



    try {
        const connection = await pool.getConnection(async conn => conn);
        try {

            const selectLoationQuery = `
            SELECT *
            FROM location
            WHERE elder_idx = ?;
            `
            const selectLoationParams = [elderIdx];

            const [locationRows] = await connection.query(selectLoationQuery, selectLoationParams);

            if (locationRows.length == 0) {

                const insertLocationQuery = `
                INSERT INTO
                location(elder_idx, latitude, longitude)
                VALUES (?, ?, ?);
                `;

                let insertLocationParams = [elderIdx, latitude, longitude];

                await connection.query(insertLocationQuery, insertLocationParams);

            }
            else {
                const updateLocationQuery = `
                    UPDATE location
                    SET latitude = ?, longitude = ?
                    WHERE elder_idx = ?;
                `;

                const updateLocationParams = [latitude, longitude, elderIdx];

                await connection.query(updateLocationQuery, updateLocationParams);

            }



            connection.release();

            return res.json({
                isSuccess: true,
                code: 200,
                message: "위치 업데이트 하기 성공"
            });

        } catch (err) {
            connection.release();
            logger.error(`돌보미 - 방문일정 등록 Query error\n: ${err.message}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    } catch (err) {
        logger.error(`돌보미 - 방문일정 등록 DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}



/// 돌보미 api
exports.calendarList = async function (req, res) {

    try {
        const connection = await pool.getConnection(async conn => conn);
        try {

            const selectCalendarQuery = `
                    SELECT c.*,u.name
                    FROM
                    calendar as c
                    INNER JOIN
                    user as u
                    ON c.elder_idx = u.idx
                    order by c.created_at desc;
                `;

            const [resultRows] = await connection.query(selectCalendarQuery);


            connection.release();

            return res.json({
                result: resultRows,
                isSuccess: true,
                code: 200,
                message: "방문일정 리스트 조회 성공"
            });

        } catch (err) {
            connection.release();
            logger.error(`돌보미 - 방문일정 등록 Query error\n: ${err.message}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    } catch (err) {
        logger.error(`돌보미 - 방문일정 등록 DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

exports.calendarAdd = async function (req, res) {
    const { elder_idx, visit_time, visit_date, visit_content } = req.body;

    if (!elder_idx || !visit_time || !visit_date || !visit_content) return res.json({ isSuccess: false, code: 301, message: "모든내용을 입력해주세요." });

    try {
        const connection = await pool.getConnection(async conn => conn);
        try {

            const insertCalendarQuery = `
                INSERT INTO
                calendar(elder_idx, visit_time, visit_date, visit_content)
                VALUES (?, ?, ?, ?);
                `;

            let insertCalendarParams = [elder_idx, visit_time, visit_date, visit_content];

            await connection.query(insertCalendarQuery, insertCalendarParams);


            connection.release();

            return res.json({
                isSuccess: true,
                code: 200,
                message: "방문일정 등록 성공"
            });

        } catch (err) {
            connection.release();
            logger.error(`돌보미 - 방문일정 등록 Query error\n: ${err.message}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    } catch (err) {
        logger.error(`돌보미 - 방문일정 등록 DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}


exports.stateList = async function (req, res) {


    try {
        const connection = await pool.getConnection(async conn => conn);
        try {

            const selectElderQuery = `
                SELECT *
                FROM
                user
                WHERE type = 'ELDER'
                `;


            const [elderRows] = await connection.query(selectElderQuery);

            let selectStateQuery = `
                SELECT c.idx, c.elder_idx, u.name, c.state
                FROM
                contact as c
                INNER JOIN
                user as u
                ON c.elder_idx = u.idx
                WHERE elder_idx = ?
                order by c.created_at desc
                limit 1;
            `;

            let selectStateParams;
            let stateRows;

            let resultRows = [];
            for (let i = 0; i < elderRows.length; i++) {
                selectStateParams = [elderRows[i].idx];

                [stateRows] = await connection.query(selectStateQuery, selectStateParams);

                if (stateRows.length != 0) {
                    resultRows.push(stateRows[0]);
                }

            }

            connection.release();

            return res.json({
                result: resultRows,
                isSuccess: true,
                code: 200,
                message: "어르신 상태 리스트 조회 성공"
            });

        } catch (err) {
            connection.release();
            logger.error(`돌보미 - 어르신 상태 리스트 조회 Query error\n: ${err.message}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    } catch (err) {
        logger.error(`돌보미 - 어르신 상태 리스트 조회 DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

exports.locationList = async function (req, res) {


    try {
        const connection = await pool.getConnection(async conn => conn);
        try {

            const selectLocationQuery = `
                    SELECT l.idx, l.elder_idx, u.name, l.latitude, l.longitude, u.phone
                    FROM location as l
                    INNER JOIN
                    user u on l.elder_idx = u.idx;
                `;


            const [locationRows] = await connection.query(selectLocationQuery);

            let address;

            for (let i = 0; i < locationRows.length; i++) {

                await axios({
                    method: 'get',
                    url: 'https://dapi.kakao.com/v2/local/geo/coord2address.json?x=' + locationRows[i].longitude + '&y=' + locationRows[i].latitude,
                    headers: {
                        'Authorization': 'KakaoAK ' + 'be505fd593fff238a8109cf15922e92f'
                    }
                })
                    .then(function (response) {
                        address = response.data.documents[0].address.address_name;
                    });

                locationRows[i].address = address;

            }

            connection.release();

            return res.json({
                result: locationRows,
                isSuccess: true,
                code: 200,
                message: "어르신 위치 리스트 조회"
            });

        } catch (err) {
            connection.release();
            logger.error(`돌보미 - 어르신 상태 리스트 조회 Query error\n: ${err.message}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    } catch (err) {
        logger.error(`돌보미 - 어르신 상태 리스트 조회 DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

exports.userList = async function (req, res) {


    try {
        const connection = await pool.getConnection(async conn => conn);
        try {

            const selectUserQuery = `
                    SELECT *
                    FROM user
                    WHERE type = 'ELDER';
                `;

            const [userRows] = await connection.query(selectUserQuery);


            connection.release();

            return res.json({
                result: userRows,
                isSuccess: true,
                code: 200,
                message: "어르신 정보 리스트 조회"
            });

        } catch (err) {
            connection.release();
            logger.error(`돌보미 - 어르신 상태 리스트 조회 Query error\n: ${err.message}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    } catch (err) {
        logger.error(`돌보미 - 어르신 상태 리스트 조회 DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

