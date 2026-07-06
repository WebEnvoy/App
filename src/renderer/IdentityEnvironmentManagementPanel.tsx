import { RefreshCw, ShieldCheck } from "lucide-react";
import type { FormEvent } from "react";

import type { HarborIdentityLoadState } from "./harborIdentityTypes";

export type IdentityManagementMode = "closed" | "create" | "import";

export function HarborConnectionStrip({
  harborEndpoint,
  state,
  onRefresh,
}: {
  harborEndpoint: string;
  state: HarborIdentityLoadState;
  onRefresh: () => void;
}) {
  return (
    <section className={`identity-connection-strip identity-connection-${state.status}`} aria-label="Harbor 连接状态">
      <div>
        <strong>{state.status === "ready" ? "Harbor live" : state.status === "loading" ? "Harbor checking" : "Harbor offline"}</strong>
        <span>{harborEndpoint}</span>
      </div>
      <p>{state.summary}</p>
      <button type="button" onClick={onRefresh}>
        <RefreshCw size={14} />
        刷新 Harbor
      </button>
    </section>
  );
}

export function IdentityEnvironmentManagementPanel({
  importText,
  message,
  mode,
  onCancel,
  onCreate,
  onImport,
  onImportTextChange,
}: {
  importText: string;
  message: string;
  mode: IdentityManagementMode;
  onCancel: () => void;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  onImport: () => void;
  onImportTextChange: (value: string) => void;
}) {
  if (mode === "closed" && !message) return null;

  return (
    <section className="identity-management-panel" aria-label="身份环境创建导入">
      <div className="identity-management-heading">
        <ShieldCheck size={16} />
        <div>
          <strong>{mode === "import" ? "导入 Harbor public summary" : mode === "create" ? "创建本地身份环境配置" : "身份环境状态"}</strong>
          <span>只保存允许的配置、选择和脱敏引用；不保存账号密码、Cookie、token、profile 原始内容。</span>
        </div>
      </div>

      {message ? <p className="identity-management-message">{message}</p> : null}

      {mode === "create" ? (
        <form className="identity-management-form" onSubmit={onCreate}>
          <label>
            名称
            <input name="name" placeholder="小红书运营号 A" />
          </label>
          <label>
            站点
            <select name="siteId" defaultValue="xiaohongshu">
              <option value="xiaohongshu">小红书</option>
              <option value="boss">BOSS</option>
            </select>
          </label>
          <label>
            账号标签
            <input name="accountLabel" placeholder="运营号 / 招聘号" />
          </label>
          <label>
            Identity ref
            <input name="identityEnvironmentRef" placeholder="identity-env_local-ref" />
          </label>
          <label>
            Profile ref
            <input name="profileRef" placeholder="profile_local-ref" />
          </label>
          <label>
            Provider
            <select name="requestedProviderId" defaultValue="cloakbrowser">
              <option value="cloakbrowser">CloakBrowser</option>
              <option value="chrome_official">官方 Chrome 受限后备</option>
            </select>
          </label>
          <label>
            登录态
            <select name="loginState" defaultValue="unknown">
              <option value="logged_in">已登录</option>
              <option value="manual_auth_required">需要人工认证</option>
              <option value="expired">已过期</option>
              <option value="unknown">未知</option>
            </select>
          </label>
          <label>
            人工认证
            <select name="manualAuthenticationState" defaultValue="required">
              <option value="not_required">无需认证</option>
              <option value="required">需要认证</option>
              <option value="in_progress">认证中</option>
            </select>
          </label>
          <label>
            代理摘要
            <input name="proxyLabel" placeholder="proxy_ref 或地区摘要" />
          </label>
          <label>
            地区
            <input name="region" placeholder="CN-SH" />
          </label>
          <label>
            语言
            <input name="language" placeholder="zh-CN" />
          </label>
          <label>
            时区
            <input name="timezone" placeholder="Asia/Shanghai" />
          </label>
          <label>
            指纹摘要
            <input name="fingerprintSummary" placeholder="provider_claim 或 configured summary" />
          </label>
          <div className="identity-management-actions">
            <button type="submit">保存本地允许配置</button>
            <button type="button" onClick={onCancel}>取消</button>
          </div>
        </form>
      ) : null}

      {mode === "import" ? (
        <div className="identity-management-import">
          <textarea
            value={importText}
            onChange={(event) => onImportTextChange(event.currentTarget.value)}
            placeholder='{"schema_version":"harbor-local-identity-environment/v0", ...}'
          />
          <div className="identity-management-actions">
            <button type="button" onClick={onImport}>导入脱敏摘要</button>
            <button type="button" onClick={onCancel}>取消</button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
