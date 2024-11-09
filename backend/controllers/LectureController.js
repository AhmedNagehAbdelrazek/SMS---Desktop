const expressAsyncHandler = require("express-async-handler");
const { Lecture } = require("../models");

exports.getAllLectures = expressAsyncHandler(async (req, res) => {
    const lectures = await Lecture.findAll();
    res.status(200).json(lectures);
});

exports.getAllLecturesForGroup = expressAsyncHandler(async (req, res) => {
    const { groupId } = req.params;
    const lectures = await Lecture.findAll({where: { group_id: groupId }  });
    res.status(200).json(lectures);
});
