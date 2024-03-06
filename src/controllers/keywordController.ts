import Keywords  from "../database/models/Keywords";
import { Request, Response } from "express";

// create a cache for the keywords
let keywordCache = [
  "badword1",
  "badword2",
  "gali1",
  "gali2",
  "fuck",
  "bhenchod"
];

const checkKeywordExists = (keyword: string) => {
  return keywordCache.includes(keyword);
};


export const addKeywordToDB = async (req: Request, res: Response) => {

  const { keyword } = req.body;
  console.log("Keyword: ", keyword);
  if (!keyword) {
    return res.status(400).json({ message: "Keyword is required" });
  }
  try {
    //check if a document already exists in the database
    const keywordData = await Keywords.find({});

    if (checkKeywordExists(keyword)) {
      console.log("Keyword already exists in db!");
      return res.status(201).json({message: "Keyword already exists in db!"})
    }

    if (keywordData.length) {
      // update the existing document
      const updatedKeywords = await
        Keywords.findOneAndUpdate(
          { _id: keywordData[0]._id },
          { $push: { keywords: keyword } },
          { new: true }
        );
      if (updatedKeywords) {
        return res.status(201).json({ message: "Keyword added successfully!", data: updatedKeywords });
      }
    } else {
      // create a new document
      const newKeywords = await Keywords.create({ keywords: [keyword] });
      if (newKeywords) {
        return res.status(201).json({ message: "Keyword added successfully" });
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const fetchKeywords = async (req: Request, res: Response) => {
  try {
    const keywordData = await Keywords.find({});
    if (keywordData.length) {
      return res.status(200).json({ keywords: keywordData[0].keywords });
    } else {
      return res.status(404).json({ message: "No keywords found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteKeywordFromDB = async (req: Request, res: Response) => {
  const { keyword } = req.body;
  if (!keyword) {
    return res.status(400).json({ message: "Keyword is required" });
  }
  try {
    const keywordData = await Keywords.find({});
    if (keywordData.length) {
      const updatedKeywords = await Keywords.findOneAndUpdate(
        { _id: keywordData[0]._id },
        { $pull: { keywords: keyword } },
        { new: true }
      );
      if (updatedKeywords) {
        return res.status(200).json({ message: "Keyword deleted successfully", data: updatedKeywords });
      }
    } else {
      return res.status(404).json({ message: "No keywords found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};