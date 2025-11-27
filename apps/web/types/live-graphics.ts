export interface LiveGraphic {
  id: string;
  tenantId: string;
  name: string;
  description?: string | null;
  publicCode: string;
  controlCode: string;
  filePath?: string | null;
  publicUrl?: string | null;
  stateUrl?: string;
  state: Record<string, any>;
  clientSnippet?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateLiveGraphicState {
  title?: string;
  subtitle?: string;
  leftName?: string;
  rightName?: string;
  leftScore?: number;
  rightScore?: number;
  statusText?: string;
  message?: string;
  extra?: Record<string, any>;
}
