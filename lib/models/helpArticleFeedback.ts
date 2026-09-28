import { ObjectId } from "mongodb";

export type HelpArticleFeedbackValue =
  | "helpful"
  | "not_helpful";

export interface HelpArticleFeedback {
  _id?: ObjectId;

  /**
   * The article route/slug.
   * Example:
   * /help/buying
   * /help/selling/create-listing
   */
  articleSlug: string;

  /**
   * Logged-in user who submitted the feedback.
   */
  userId: ObjectId;

  /**
   * Feedback choice.
   */
  feedback: HelpArticleFeedbackValue;

  /**
   * Optional explanation when the user selects
   * "Not helpful".
   */
  comment?: string | null;

  createdAt: Date;
  updatedAt: Date;
}