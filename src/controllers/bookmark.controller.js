const { Bookmark } = require("../models");

// ==================== 북마크 생성 ====================
const createBookmark = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { question, answer, sources } = req.body;

    // 필수 필드 검증
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "질문과 답변은 필수입니다.",
      });
    }

    const bookmark = await Bookmark.create({
      userID,
      question,
      answer,
      sources: sources || null,
    });

    return res.status(201).json({
      success: true,
      message: "북마크가 저장되었습니다.",
      bookmark,
    });

  } catch (err) {
    console.error("Bookmark Creation Error:", err);
    return res.status(500).json({
      success: false,
      message: "북마크 저장 실패",
    });
  }
};


// ==================== 내 북마크 목록 조회 ====================
const getMyBookmarks = async (req, res) => {
  try {
    const userID = req.user.userID;

    const bookmarks = await Bookmark.findAll({
      where: { userID },
      order: [["createdAt", "DESC"]],
      attributes: ["bookmarkID", "question", "createdAt"], // 목록에서는 간단하게
    });

    return res.json({
      success: true,
      bookmarks,
    });

  } catch (err) {
    console.error("Get Bookmarks Error:", err);
    return res.status(500).json({
      success: false,
      message: "북마크 조회 실패",
    });
  }
};


// ==================== 북마크 상세 조회 ====================
const getBookmarkDetail = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { bookmarkID } = req.params;

    const bookmark = await Bookmark.findOne({
      where: {
        bookmarkID,
        userID, // 본인 것만 조회 가능
      },
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "북마크를 찾을 수 없습니다.",
      });
    }

    return res.json({
      success: true,
      bookmark,
    });

  } catch (err) {
    console.error("Get Bookmark Detail Error:", err);
    return res.status(500).json({
      success: false,
      message: "북마크 조회 실패",
    });
  }
};


// ==================== 북마크 삭제 ====================
const deleteBookmark = async (req, res) => {
  try {
    const userID = req.user.userID;
    const { bookmarkID } = req.params;

    const bookmark = await Bookmark.findOne({
      where: {
        bookmarkID,
        userID,
      },
    });

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: "삭제할 북마크가 없습니다.",
      });
    }

    await bookmark.destroy();

    return res.json({
      success: true,
      message: "북마크가 삭제되었습니다.",
    });

  } catch (err) {
    console.error("Delete Bookmark Error:", err);
    return res.status(500).json({
      success: false,
      message: "북마크 삭제 실패",
    });
  }
};


module.exports = {
  createBookmark,
  getMyBookmarks,
  getBookmarkDetail,
  deleteBookmark,
};