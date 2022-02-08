class MainController {
  static index(req, res, next) {
    return res.json({
      msg: "this is main test",
    });
  }
}
export default MainController;
