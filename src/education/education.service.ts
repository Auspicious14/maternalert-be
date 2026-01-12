import { Injectable, NotFoundException } from "@nestjs/common";
import { EDUCATION_CONTENT, EducationArticle } from "./data/education.content";

/**
 * Education Service
 *
 * RESPONSIBILITIES:
 * - Serve static, curated education content
 * - Filter by category
 * - Retrieve single articles
 *
 * CLINICAL SAFETY:
 * - Read-only access to curated content
 * - No dynamic user-generated content allowed
 */
@Injectable()
export class EducationService {
  /**
   * Get all education articles
   */
  findAll(): EducationArticle[] {
    return EDUCATION_CONTENT;
  }

  /**
   * Get articles by category
   */
  findByCategory(category: string): EducationArticle[] {
    return EDUCATION_CONTENT.filter((article) => article.category === category);
  }

  /**
   * Get single article by ID
   */
  findOne(id: string): EducationArticle {
    const article = EDUCATION_CONTENT.find((a) => a.id === id);

    if (!article) {
      throw new NotFoundException("Article not found");
    }

    return article;
  }
}
