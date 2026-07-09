// id_typeexam ground truth (verified against the live `typeexam` table, NOT the numeric-sounding
// name): 1 = หัวข้อ (title), 2 = สอบร้อยเปอร์เซนต์ (100%), 3 = สอบหกสิบเปอร์เซนต์ (60%).
// project.id_statusproject transitions per stage, keyed by id_typeexam:
const SUBMIT_STATUS = { 1: 2, 3: 7, 2: 11 };
const APPROVE_STATUS = { 1: 3, 3: 8, 2: 12 };
const ASSIGN_STATUS = { 1: 5, 3: 9, 2: 13 };
const PASS_STATUS = { 1: 15, 3: 10, 2: 14 };

// exam.id_statusproject uses the same statusproject lookup table but a distinct phase-tracking
// sub-range: 20=submitted/pending, 21=approved/awaiting exam, 22/23/24/25=final result.
const EXAM_PENDING = 20;
const EXAM_APPROVED = 21;
const EXAM_FAIL = 22;
const EXAM_RESUBMIT = 23; // 100%-exam soft fail: allowed to resubmit within the semester
const EXAM_PASS = 24;
const EXAM_FAIL_FINAL = 25; // 100%-exam hard fail (F)

// resultexam outcome codes an officer can record, and what they mean per exam type.
// 0 = fail, 1 = pass, 3 = hard fail (100% exam only — "ไม่ผ่าน(F)").
function resolveResult(id_typeexam, resultexam) {
  const t = parseInt(id_typeexam);
  const r = parseInt(resultexam);

  if (r === 1) {
    return { exam_status: EXAM_PASS, project_status: PASS_STATUS[t] };
  }
  if (t === 1) {
    // title exam fail: project resets to 0 (no active topic), account disabled
    return { exam_status: EXAM_FAIL, project_status: 0, disableUser: true };
  }
  if (t === 3) {
    // 60% exam fail: rolled back to await resubmission from the post-ทก.01 stage
    return { exam_status: EXAM_FAIL, project_status: 6 };
  }
  if (t === 2) {
    if (r === 3) {
      // 100% exam hard fail (F): permanent, account disabled
      return { exam_status: EXAM_FAIL_FINAL, project_status: 17, disableUser: true };
    }
    // 100% exam soft fail: may resubmit within the semester
    return { exam_status: EXAM_RESUBMIT, project_status: 19 };
  }
  throw new Error('Unknown id_typeexam');
}

module.exports = {
  SUBMIT_STATUS,
  APPROVE_STATUS,
  ASSIGN_STATUS,
  PASS_STATUS,
  EXAM_PENDING,
  EXAM_APPROVED,
  EXAM_FAIL,
  EXAM_RESUBMIT,
  EXAM_PASS,
  EXAM_FAIL_FINAL,
  resolveResult,
};
