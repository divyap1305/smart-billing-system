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
                    echo 'Skipping tests...'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo 'Skipping frontend build...'
            }
        }

        stage('Success') {
            steps {
                echo 'Pipeline executed successfully!'
            }
        }
    }
}