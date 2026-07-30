# Kubernetes 部署

使用本仓库多阶段 `Dockerfile` 构建镜像后部署。示例清单仍参考上游结构，镜像请换成你自己的构建结果。

## 构建镜像

```bash
docker build -t linux-command:local .
```

## 应用清单

```bash
kubectl apply -f linux-command.yaml
```

将 `linux-command.yaml` / Helm values 中的 `image` 改为你的镜像地址。默认 Service 将容器 `3000` 映射到 `9665`。
