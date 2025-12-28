# Urban Planning Document Generation Implementation Plan

## TypeScript & Learning Principles

This document generation system is built with emphasis on clear, understandable code:

- **Type safety first** - Use TypeScript's type system to model document structures and data flows
- **Explicit over implicit** - Class methods and interfaces are clearly documented with examples
- **Patterns over magic** - Standard patterns (decorators, factories, services) are preferred over clever code
- **Comments on why** - Implementation includes reasoning for complex decisions in the actual code
- **Code is educational** - Every file and function includes comments explaining what it does, why it exists, and how it connects to other parts of the system

Code examples throughout show best practices in TypeScript design patterns, and actual implementation includes helpful comments to guide understanding.

### UI & Design Consistency

All user-facing components follow the design system documented in [DESIGN_LANGUAGE.md](./DESIGN_LANGUAGE.md). When building document generation UI:
- Use components from the centralized design system (`apps/fullstack/app/components/elements.tsx`)
- Follow the established sizing (B3Size) and variant (B3Variant) patterns
- Ensure dark mode support
- Maintain accessibility standards

This ensures the document generation interface has consistent, professional styling aligned with the rest of the application.

## Overview

Build an automated urban planning document generation system from the ground up. This plan outlines the core project/module architecture with document templating, data integration, and export capabilities.

## Repo conventions (Planner namespace)

In this repo, new “Planner” features should live under the `planner/` namespace so we can keep upstream Placemark updates manageable:

- Routes: `apps/fullstack/pages/planner/*`
- Implementation: `apps/fullstack/app/planner/*` (future: `app/planner/projects`, `app/planner/modules`, `app/planner/documents`, etc.)

## Planned Architecture Components

### Core Features to Implement
- **Project System** (`app/projects/`) - Container for planning projects
- **Module System** (`app/modules/`) - Reusable components (census, demographics)
- **Census Geography Module** - Demographic data integration
- **Export Functionality** - Map and data export capabilities
- **Drawing Tools** - Site plan creation and editing
- **Database Schema** - PostgreSQL with Prisma ORM
- **Authentication & Organizations** - Multi-tenant architecture

### Target Data Flow
```
Projects → Modules → Geospatial Data → Visualizations → Exports
```

## Document Generation Architecture

### Document Generation Data Flow
```
Projects → Document Templates → Data Integration → Report Generation → PDF/Web Export
```

## Implementation Phases

### Phase 1: Document Template Framework

#### 1.1 Database Schema Extensions

**New Tables:**
```sql
-- Document Templates
DocumentTemplate {
  id: string (UUID)
  name: string
  description: string
  templateType: DocumentTemplateType
  content: JSON // Template structure
  variables: JSON // Required data variables
  organizationId: string
  createdById: string
  createdAt: DateTime
  updatedAt: DateTime
}

-- Document Template Types
DocumentTemplateType {
  id: string
  name: string // "Site Plan Report", "Zoning Analysis", "Environmental Impact"
  category: string // "Zoning", "Environmental", "Development"
  requiredModules: string[] // Required module types
}

-- Generated Documents
GeneratedDocument {
  id: string (UUID)
  projectId: string
  templateId: string
  title: string
  status: DocumentStatus // "draft", "generated", "exported"
  content: JSON // Populated template
  exportUrl: string?
  createdById: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 1.2 Template Management System

**Components:**
- `app/components/document-templates/`
  - `DocumentTemplateList.tsx` - Browse available templates
  - `DocumentTemplateEditor.tsx` - Visual template builder
  - `DocumentTemplatePreview.tsx` - Preview with sample data
  - `TemplateVariableManager.tsx` - Define required data fields

**API Endpoints:**
- `app/documentTemplates/queries/getDocumentTemplates.ts`
- `app/documentTemplates/mutations/createDocumentTemplate.ts`
- `app/documentTemplates/mutations/updateDocumentTemplate.ts`

#### 1.3 Template Structure Format

**JSON Template Schema:**
```typescript
interface DocumentTemplate {
  sections: DocumentSection[]
  variables: TemplateVariable[]
  styling: DocumentStyling
}

interface DocumentSection {
  id: string
  type: "text" | "table" | "map" | "chart" | "image"
  title: string
  content: string | MapConfig | TableConfig
  variables: string[] // References to data variables
  conditions?: ConditionalRule[]
}

interface TemplateVariable {
  name: string
  type: "text" | "number" | "date" | "geojson" | "array"
  source: "project" | "module" | "calculation" | "user_input"
  required: boolean
  description: string
}
```

### Phase 2: Data Integration & Population

#### 2.1 Data Extraction Service

**Service Location:** `app/lib/document-generation/`

**Key Components:**
```typescript
// Data extraction from projects and modules
class DocumentDataExtractor {
  async extractProjectData(projectId: string): Promise<ProjectData>
  async extractModuleData(moduleId: string, type: string): Promise<ModuleData>
  async extractCensusData(geometry: GeoJSON): Promise<CensusData>
  async extractCalculatedMetrics(project: Project): Promise<CalculatedData>
}

// Template population
class TemplatePopulator {
  async populateTemplate(template: DocumentTemplate, data: ExtractedData): Promise<PopulatedDocument>
  async validateRequiredData(template: DocumentTemplate, data: ExtractedData): Promise<ValidationResult>
}
```

#### 2.2 Built-in Template Library

**Common Urban Planning Templates:**

1. **Site Plan Analysis Report**
   - Project overview and location
   - Zoning compliance analysis
   - Density calculations
   - Parking and access analysis
   - Utility infrastructure assessment

2. **Demographic Impact Assessment**
   - Population analysis (using census module)
   - Housing impact projections
   - Traffic generation estimates
   - Community facility needs

3. **Environmental Review Checklist**
   - Land use compatibility
   - Environmental constraints
   - Stormwater management
   - Tree preservation analysis

4. **Zoning Compliance Report**
   - Setback analysis
   - Height restrictions
   - Floor area ratio calculations
   - Parking compliance

#### 2.3 Data Source Integration

**Implement Data Sources:**
- **Census Module** - Population, housing, economic data
- **Project Geometry** - Site boundaries, building footprints
- **Drawing Tools Data** - Site plans, layouts
- **External APIs** - Permit data, environmental layers

### Phase 3: Report Generation Engine

#### 3.1 Document Processor

**Location:** `app/lib/document-generation/processor/`

```typescript
class DocumentProcessor {
  // Convert populated template to renderable format
  async processDocument(populatedTemplate: PopulatedDocument): Promise<ProcessedDocument>
  
  // Handle different section types
  async processTextSection(section: TextSection, data: SectionData): Promise<RenderedSection>
  async processMapSection(section: MapSection, project: Project): Promise<RenderedSection>
  async processTableSection(section: TableSection, data: TableData): Promise<RenderedSection>
  async processChartSection(section: ChartSection, data: ChartData): Promise<RenderedSection>
}
```

#### 3.2 Map Integration

**Implement Map System for Documents:**
- Generate static map images for documents
- Include project geometry overlays
- Add analysis layers (zoning, demographics, constraints)
- Support multiple map views per document

```typescript
// Build document map generator (can leverage Placemark's map export if available)
class DocumentMapGenerator {
  async generateDocumentMap(config: DocumentMapConfig): Promise<StaticMapImage>
  async generateAnalysisOverlay(analysisType: string, geometry: GeoJSON): Promise<MapLayer>
}
```

### Phase 4: Export & Rendering System

#### 4.1 Multi-format Export

**PDF Generation:**
- Use `puppeteer` or `@react-pdf/renderer`
- Professional layout with headers, footers, page numbers
- Embedded maps and charts
- Table of contents generation

**Web Export:**
- Responsive HTML reports
- Interactive maps (using existing map component)
- Shareable links with access control

**Word Document:**
- `.docx` generation for collaborative editing
- Preserve formatting and embedded images

#### 4.2 Export API

```typescript
class DocumentExporter {
  async exportToPDF(document: ProcessedDocument): Promise<Buffer>
  async exportToHTML(document: ProcessedDocument): Promise<string>
  async exportToDocx(document: ProcessedDocument): Promise<Buffer>
  async generateShareableLink(documentId: string): Promise<string>
}
```

### Phase 5: User Interface Integration

#### 5.1 Project-Level Document Management

**Add to Project View:**
- "Generate Documents" section in project sidebar
- List of available templates based on project data
- Generated document history
- Quick regeneration with updated data

#### 5.2 Document Generation Workflow

**UI Flow:**
1. **Template Selection** - Choose from available templates
2. **Data Review** - Verify required data is available
3. **Customization** - Override template variables if needed
4. **Generation** - Process and create document
5. **Preview** - Review before export
6. **Export** - Choose format and download

#### 5.3 Template Builder Interface

**Visual Template Editor:**
- Drag-and-drop section builder
- Live preview with sample data
- Variable binding interface
- Conditional logic editor

## Technical Implementation Details

### Database Schema

```sql
-- Include in initial schema design
-- Projects table should include:
documentMetadata JSONB

-- Modules table should include:
documentExportable BOOLEAN DEFAULT false

-- Indexes for document queries
CREATE INDEX "DocumentTemplate_organizationId_idx" ON "DocumentTemplate"("organizationId");
CREATE INDEX "GeneratedDocument_projectId_idx" ON "GeneratedDocument"("projectId");
```

### API Routes

**Document API Endpoints:**
- `/api/documents/templates` - Template CRUD operations
- `/api/documents/generate` - Document generation endpoint
- `/api/documents/export` - Export endpoint
- `/api/documents/preview` - Preview generation

### Background Processing

**For Large Documents:**
- Implement job queue with `bull` or similar (Redis-based)
- Background document generation for complex reports
- Progress tracking and notifications
- Email delivery for completed documents

### Security Considerations

**Access Control:**
- Documents inherit project access permissions
- Template access based on organization membership
- Export tracking and audit logs
- Sensitive data masking options

## System Integration

### Core System Connections

1. **Project System** - Include document generation as core feature
2. **Module System** - Flag modules as "document-exportable"
3. **Export System** - Unified export interface for maps and documents
4. **Authentication** - Standard auth for document access control
5. **Organizations** - Templates and documents scoped to organizations

### Architecture Principles

- Document generation is a first-class feature alongside mapping
- Unified data model for projects, modules, and documents
- Shared authentication and authorization patterns
- Consistent UI/UX across all features

## Development Priorities

### MVP (Minimum Viable Product)
1. Basic template system with 2-3 predefined templates
2. Simple data extraction from projects
3. PDF export functionality
4. Integration with existing project interface

### Phase 2 Enhancements
1. Visual template builder
2. Advanced data integration (census, external APIs)
3. Multiple export formats
4. Sharing and collaboration features

### Future Enhancements
1. AI-assisted content generation
2. Regulatory compliance checking
3. Multi-language template support
4. Advanced analytics and reporting

## Success Metrics

- **User Adoption** - Percentage of projects using document generation
- **Template Usage** - Most popular document types
- **Export Volume** - Number of documents generated monthly
- **Time Savings** - Reduction in manual report creation time
- **User Satisfaction** - Feedback on document quality and usefulness

## Conclusion

This implementation plan outlines a comprehensive urban planning document generation system built on a modern GIS foundation. The modular approach allows for incremental development and testing, ensuring a stable core while progressively adding powerful document automation capabilities.

The system integrates mapping, data analysis, and document generation into a unified platform, directly addressing the goal of automated urban planning document creation. By designing document generation as a first-class feature from the start, the architecture avoids retrofitting challenges and creates a cohesive user experience.
