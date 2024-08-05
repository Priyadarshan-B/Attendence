const pool = require("./database");

async function get_database(query, params) {
  try {
    const [result] = await pool.promise().query(query, params);
    return result;
  } catch (err) {
    throw new Error(`Error executing get query: ${query}. ${err.message}`);
  }
}

async function post_database(
  query,
  params,
  success_message = "Posted Successfully"
) {
  try {
    const [result] = await pool.promise().query(query, params);
    return result, success_message;
  } catch (err) {
    throw new Error(`Error executing get query: ${query}. ${err.message}`);
  }
}

module.exports = { get_database, post_database };
