import { poolW5 } from "../db.config.js";

// Review 데이터 삽입
export const addReview = async (data) => {
  const conn = await poolW5.getConnection();
  try {
    const [result] = await conn.query(
      `INSERT INTO review (user_email, store_id, rating, comment) VALUES (?, ?, ?, ?);`,
      [data.userEmail, data.storeId, data.rating, data.comment]
    );
    return result.insertId;
  } catch (err) {
    throw new Error(`오류가 발생했습니다: ${err}`);
  } finally {
    conn.release();
  }
};

// Review 정보 얻기
export const getReviewById = async (reviewId) => {
  const conn = await poolW5.getConnection();
  try {
    const [rows] = await conn.query(`SELECT * FROM review WHERE id = ?;`, [
      reviewId,
    ]);
    return rows.length > 0 ? rows[0] : null;
  } catch (err) {
    throw new Error(`오류가 발생했습니다: ${err}`);
  } finally {
    conn.release();
  }
};
