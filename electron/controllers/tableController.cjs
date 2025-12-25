const { db, notify } = require('../database.cjs');
const crypto = require('crypto');

module.exports = {
  getHalls: () => db.prepare('SELECT * FROM halls').all(),

  addHall: (name) => {
    const id = crypto.randomUUID();
    const res = db.prepare('INSERT INTO halls (id, name) VALUES (?, ?)').run(id, name);
    notify('halls', null);
    return res;
  },

  deleteHall: (id) => {
    db.prepare('DELETE FROM tables WHERE hall_id = ?').run(id);
    const res = db.prepare('DELETE FROM halls WHERE id = ?').run(id);
    notify('halls', null);
    notify('tables', null);
    return res;
  },

  getTables: () => db.prepare('SELECT * FROM tables').all(),

  getTablesByHall: (id) => db.prepare('SELECT * FROM tables WHERE hall_id = ?').all(id),

  addTable: (hallId, name) => {
    const id = crypto.randomUUID();
    const res = db.prepare('INSERT INTO tables (id, hall_id, name) VALUES (?, ?, ?)').run(id, hallId, name);
    notify('tables', null);
    return res;
  },

  deleteTable: (id) => {
    const res = db.prepare('DELETE FROM tables WHERE id = ?').run(id);
    notify('tables', null);
    return res;
  },

  updateTableGuests: (id, count) => {
    const res = db.prepare("UPDATE tables SET guests = ?, status = 'occupied', start_time = COALESCE(start_time, ?) WHERE id = ?")
      .run(count, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), id);
    notify('tables', null);
    return res;
  },

  updateTableStatus: (id, status) => {
    const res = db.prepare('UPDATE tables SET status = ? WHERE id = ?').run(status, id);
    notify('tables', null);
    return res;
  },

  closeTable: (id) => {
    db.prepare('DELETE FROM order_items WHERE table_id = ?').run(id);
    const res = db.prepare(`UPDATE tables SET status = 'free', guests = 0, start_time = NULL, total_amount = 0 WHERE id = ?`).run(id);
    notify('tables', null);
    notify('table-items', id);
    return res;
  }
};