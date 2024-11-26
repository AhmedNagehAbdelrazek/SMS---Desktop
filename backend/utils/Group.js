const { Group, Lecture } = require("../models/");

exports.getLastLectureId = async (group_id) => {
  const group = await Group.findByPk(group_id, { where: { isDeleted: false } });
  if (!group) {
    throw new Error("Group not found");
  }

  const lastLecture = await Lecture.findOne({ where: { group_id }, order: [['id', 'DESC']] });

  if(!lastLecture && group.last_lecture_number == 0){
    group.last_lecture_number = 1;
    await group.update({ last_lecture_number: 1 });

    const newLecture = await Lecture.create({ group_id, lecture_number: 1, name: `Lecture 1` });
    return newLecture.id;
  }
  console.log(lastLecture);
  
  const lastTimeupdated = new Date(lastLecture?.createdAt);

  // after at least 7 days since last update, we can fetch new lecture number
  if (lastTimeupdated < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
  // if (lastTimeupdated < new Date(Date.now() - 10 * 1000)) {
    let lectureLectureNumber = group.last_lecture_number;
    lectureLectureNumber++;
    await group.update({ last_lecture_number: lectureLectureNumber});
    const newLecture = await Lecture.create({ group_id, lecture_number: lectureLectureNumber, name: `Lecture ${lectureNumber}` });

    return newLecture.id;
  }
  return lastLecture.id;
};

// exports.getLastLectureId = async (group_id) => {
//   const lectureNumber = await getLectrueNumber(group_id);
//   const lecture = await Lecture.findOne({ where: { group_id, lecture_number: lectureNumber }, order: [['id', 'DESC']] });
//   if (!lecture) {
//     const newLecture = await Lecture.create({ group_id, lecture_number: lectureNumber, name: `Lecture ${lectureNumber}` });
//     return newLecture.id;
//   }
//   return lecture.id;
// }
