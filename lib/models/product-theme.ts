import db from "@/lib/db";

export interface ProductTheme {
  theme_id: string;
  product_id: string;
  primary_bg_color: string;
  secondary_bg_color: string;
  accent_bg_color: string;
  primary_text_color: string;
  secondary_text_color: string;
  accent_text_color: string;
  link_color: string;
  link_hover_color: string;
  primary_button_bg: string;
  primary_button_text: string;
  primary_button_hover_bg: string;
  secondary_button_bg: string;
  secondary_button_text: string;
  secondary_button_hover_bg: string;
  card_bg_color: string;
  card_border_color: string;
  card_shadow_color: string;
  header_bg_color: string;
  header_text_color: string;
  footer_bg_color: string;
  footer_text_color: string;
  font_family: string;
  h1_font_size: string;
  h1_font_weight: string;
  h2_font_size: string;
  h2_font_weight: string;
  h3_font_size: string;
  h3_font_weight: string;
  body_font_size: string;
  body_line_height: string;
  section_padding: string;
  card_padding: string;
  button_padding: string;
  border_radius_sm: string;
  border_radius_md: string;
  border_radius_lg: string;
  border_radius_xl: string;
  max_width: string;
  container_padding: string;
  gradient_start: string;
  gradient_end: string;
  shadow_color: string;
  custom_css?: string;
}

async function withConnection<T>(
  operation: (connection: any) => Promise<T>
): Promise<T> {
  const connection = await db.getConnection();
  try {
    return await operation(connection);
  } finally {
    connection.release();
  }
}

export async function getProductThemeByProductId(
  productId: string,
  connection?: any
): Promise<ProductTheme | null> {
  const conn = connection || (await db.getConnection());
  try {
    const result = await conn.query(
      "SELECT * FROM product_themes WHERE product_id = $1",
      [productId]
    );
    return result.rows.length === 0 ? null : (result.rows[0] as ProductTheme);
  } finally {
    if (!connection) conn.release();
  }
}

export async function createOrUpdateProductTheme(
  theme: Omit<ProductTheme, "theme_id">, // Omit theme_id as it's auto-generated
  connection?: any
): Promise<ProductTheme> {
  const conn = connection || (await db.getConnection());
  try {
    // Check if a theme already exists for this product
    const existingTheme = await getProductThemeByProductId(
      theme.product_id,
      conn
    );

    if (existingTheme) {
      // Update existing theme
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      let paramCount = 1;

      // Build the SET clause dynamically
      Object.entries(theme).forEach(([key, value]) => {
        if (key !== "product_id") {
          updateFields.push(`${key} = $${paramCount++}`);
          updateValues.push(value);
        }
      });

      updateValues.push(theme.product_id);

      const result = await conn.query(
        `UPDATE product_themes SET ${updateFields.join(", ")} WHERE product_id = $${paramCount} RETURNING *`,
        updateValues
      );

      return result.rows[0] as ProductTheme;
    } else {
      // Create new theme
      const result = await conn.query(
        `INSERT INTO product_themes (
           product_id, primary_bg_color, secondary_bg_color, accent_bg_color,
           primary_text_color, secondary_text_color, accent_text_color,
           link_color, link_hover_color, primary_button_bg, primary_button_text,
           primary_button_hover_bg, secondary_button_bg, secondary_button_text,
           secondary_button_hover_bg, card_bg_color, card_border_color,
           card_shadow_color, header_bg_color, header_text_color,
           footer_bg_color, footer_text_color, font_family, h1_font_size,
           h1_font_weight, h2_font_size, h2_font_weight, h3_font_size,
           h3_font_weight, body_font_size, body_line_height, section_padding,
           card_padding, button_padding, border_radius_sm, border_radius_md,
           border_radius_lg, border_radius_xl, max_width, container_padding,
           gradient_start, gradient_end, shadow_color, custom_css
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44)
         RETURNING *`,
        [
          theme.product_id,
          theme.primary_bg_color,
          theme.secondary_bg_color,
          theme.accent_bg_color,
          theme.primary_text_color,
          theme.secondary_text_color,
          theme.accent_text_color,
          theme.link_color,
          theme.link_hover_color,
          theme.primary_button_bg,
          theme.primary_button_text,
          theme.primary_button_hover_bg,
          theme.secondary_button_bg,
          theme.secondary_button_text,
          theme.secondary_button_hover_bg,
          theme.card_bg_color,
          theme.card_border_color,
          theme.card_shadow_color,
          theme.header_bg_color,
          theme.header_text_color,
          theme.footer_bg_color,
          theme.footer_text_color,
          theme.font_family,
          theme.h1_font_size,
          theme.h1_font_weight,
          theme.h2_font_size,
          theme.h2_font_weight,
          theme.h3_font_size,
          theme.h3_font_weight,
          theme.body_font_size,
          theme.body_line_height,
          theme.section_padding,
          theme.card_padding,
          theme.button_padding,
          theme.border_radius_sm,
          theme.border_radius_md,
          theme.border_radius_lg,
          theme.border_radius_xl,
          theme.max_width,
          theme.container_padding,
          theme.gradient_start,
          theme.gradient_end,
          theme.shadow_color,
          theme.custom_css,
        ]
      );

      return result.rows[0] as ProductTheme;
    }
  } finally {
    if (!connection) conn.release();
  }
}

export async function deleteProductThemeByProductId(
  productId: string,
  connection?: any
): Promise<boolean> {
  const conn = connection || (await db.getConnection());
  try {
    const result = await conn.query(
      "DELETE FROM product_themes WHERE product_id = $1",
      [productId]
    );
    return result.rowCount >= 0;
  } finally {
    if (!connection) conn.release();
  }
}

export async function deleteProductTheme(
  themeId: string,
  connection?: any
): Promise<boolean> {
  const conn = connection || (await db.getConnection());
  try {
    const result = await conn.query(
      "DELETE FROM product_themes WHERE id = $1",
      [themeId]
    );
    return result.rowCount > 0;
  } finally {
    if (!connection) conn.release();
  }
}