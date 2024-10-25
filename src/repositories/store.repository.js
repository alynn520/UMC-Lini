import { poolW5 } from "../db.config.js";

// Store 데이터 삽입
export const addStore = async (data) => {
  const conn = await poolW5.getConnection();
  try {
    const [result] = await conn.query(
      `INSERT INTO store (name, address, phone_number) VALUES (?, ?, ?);`,
      [data.name, data.address, data.phoneNumber]
    );
    return result.insertId;
  } catch (err) {
    throw new Error(`오류가 발생했습니다: ${err}`);
  } finally {
    conn.release();
  }
};

// Store 정보 얻기
export const getStoreById = async (storeId) => {
  const conn = await poolW5.getConnection();
  try {
    const [rows] = await conn.query(`SELECT * FROM store WHERE id = ?;`, [
      storeId,
    ]);
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    throw new Error(`오류가 발생했습니다: ${err}`);
  } finally {
    conn.release();
  }
};

// Store가 존재하는지 확인
export const storeExists = async (storeId) => {
  const conn = await poolW5.getConnection();
  try {
    const [rows] = await conn.query(`SELECT * FROM store WHERE id = ?;`, [
      storeId,
    ]);
    return rows.length > 0; // 가게가 존재하면 true 반환
  } catch (err) {
    throw new Error(`오류가 발생했습니다: ${err}`);
  } finally {
    conn.release();
  }
};
