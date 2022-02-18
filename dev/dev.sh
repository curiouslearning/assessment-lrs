helm uninstall development
docker build -t localhost:5000/assessment-lrs:registry ../app
docker push localhost:5000/assessment-lrs:registry
helm install --values ../helm/values/dev.yaml development ../helm/assessment-lrs
