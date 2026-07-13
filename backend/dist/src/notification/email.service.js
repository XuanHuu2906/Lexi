"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
let EmailService = EmailService_1 = class EmailService {
    logger = new common_1.Logger(EmailService_1.name);
    resend;
    from;
    constructor(config) {
        const key = config.get('RESEND_KEY');
        this.from =
            config.get('EMAIL_FROM') || 'Lexi <onboarding@resend.dev>';
        this.resend = key ? new resend_1.Resend(key) : null;
        if (!key) {
            this.logger.warn('RESEND_KEY not set — emails will be skipped');
        }
    }
    async send(to, subject, html) {
        if (!this.resend)
            return;
        try {
            const { error } = await this.resend.emails.send({
                from: this.from,
                to,
                subject,
                html,
            });
            if (error) {
                this.logger.warn(`Email to ${to} rejected: ${error.message}`);
            }
        }
        catch (err) {
            this.logger.warn(`Email to ${to} failed: ${String(err)}`);
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map