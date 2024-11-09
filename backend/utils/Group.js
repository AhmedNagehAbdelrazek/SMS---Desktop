const { Group, Lecture } = require("../models/");

const getLectrueNumber = async (group_id) => {
  const group = await Group.findByPk(group_id, { where: { isDeleted: false } });
  if (!group) {
    throw new Error("Group not found");
  }
  if (group.last_lecture_number == 0) {
    group.last_lecture_number = 1;
    await group.update({ last_lecture_number: 1 });
    return 1; // first lecture
  }
  const lastTimeupdated = new Date(group.updatedAt);

  // after at least 6 days since last update, we can fetch new lecture number
  if (lastTimeupdated < new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)) {
    const lectureLectureNumber = group.last_lecture_number;
    await group.update({ last_lecture_number: lectureLectureNumber + 1 });

    return lectureLectureNumber + 1;
  }
  return group.last_lecture_number;
};

exports.getLastLectureId = async (group_id) => {
  const lectureNumber = await getLectrueNumber(group_id);
  const lecture = await Lecture.findOne({ where: { group_id, lecture_number: lectureNumber }, order: [['id', 'DESC']] });
  if (!lecture) {
    const newLecture = await Lecture.create({ group_id, lecture_number: lectureNumber, name: `Lecture ${lectureNumber}` });
    return newLecture.id;
  }
  return lecture.id;
}