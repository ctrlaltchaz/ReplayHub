import { Controller, Get, Header, Param, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { LiveGraphicsService } from './live-graphics.service';

@ApiTags('Live Graphics Public')
@Controller('public/live-graphics')
export class LiveGraphicsPublicController {
  constructor(private readonly service: LiveGraphicsService) { }

  @Get('client.js')
  @ApiOperation({ summary: 'ReplayHub live graphics client script (polls state and updates DOM)' })
  @Header('Content-Type', 'application/javascript')
  async clientScript(@Res() res: Response) {
    const script = `
      (function () {
        const scriptEl = document.currentScript;
        const code = scriptEl?.getAttribute('data-replayhub-code') || '';
        const slug = scriptEl?.getAttribute('data-replayhub-slug') || '';
        const origin = (typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'file://')
          ? window.location.origin
          : '';
        const stateUrl = origin + '/api/public/live-graphics/' + slug + '/' + code + '/state';

        // Store previous values for diffing
        const lastValues = {};

        const applyValue = (el, key, value) => {
          const newValue = value ?? '';
          const oldValue = lastValues[key];
          const changed = oldValue !== newValue;

          lastValues[key] = newValue;

          if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
            el.value = newValue;
          } else {
            el.textContent = newValue;
          }

          // Emit event ONLY when value actually changes
          if (changed) {
            window.dispatchEvent(
              new CustomEvent('replayhub:field-change', {
                detail: {
                  key,
                  oldValue,
                  newValue,
                  element: el
                }
              })
            );
          }
        };

        const updateDom = (state) => {
          const data = state || {};
          document.querySelectorAll('[data-replayhub-field]').forEach((el) => {
            const key = el.getAttribute('data-replayhub-field');
            if (!key) return;
            applyValue(el, key, data[key]);
          });
        };

        const refresh = async () => {
          try {
            const res = await fetch(stateUrl, { cache: 'no-cache' });
            if (!res.ok) throw new Error('State request failed');
            const payload = await res.json();
            updateDom(payload.state || {});
          } catch (err) {
            console.warn('[ReplayHub Graphics] Failed to refresh state', err);
          } finally {
            setTimeout(refresh, 1000);
          }
        };

        refresh();
      })();
    `.trim();

    res.setHeader('Cache-Control', 'public, max-age=60');
    res.type('application/javascript').send(script);
  }

  @Get(':slug/:publicCode')
  @ApiOperation({ summary: 'Serve the hosted live graphic HTML (no client injection)' })
  @Header('Content-Type', 'text/html')
  async serveGraphic(
    @Param('slug') slug: string,
    @Param('publicCode') publicCode: string,
    @Res() res: Response
  ) {
    const html = await this.service.getPublicGraphic(slug, publicCode);
    res.send(html);
  }

  @Get(':slug/:controlCode/state')
  @ApiOperation({ summary: 'Public endpoint for overlays to fetch the latest state' })
  async getState(@Param('slug') slug: string, @Param('controlCode') controlCode: string) {
    return this.service.getPublicState(slug, controlCode);
  }
}
