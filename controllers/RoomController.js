class RoomController {
  static index(req, res, next) {
    return res.json({
      msg: "this is main test",
    });
  }
  static makeRoom(req, res, next) {
    return res.json({
      msg: "make room",
    });
  }
}
export default RoomController;
