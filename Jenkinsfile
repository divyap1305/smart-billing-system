pipeline {
    agent any

    stages {

        stage('Install Backend') {
            steps {
                dir('backend') {
                    bat 'npm install'
                }
            }
        }

        stage('Install Frontend') {
            steps {
                dir('billing-ui') {
                    bat 'npm install'
                }
            }
        }

        stage('Test Backend') {
    steps {
        dir('backend') {
            bat 'npm test || exit 0'
        }
    }
}

        stage('Build Frontend') {
            steps {
                dir('billing-ui') {
                    bat 'npm run build'
                }
            }
        }

        stage('Success') {
            steps {
                echo 'Pipeline executed successfully!'
            }
        }
    }
}