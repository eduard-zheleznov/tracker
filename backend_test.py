import requests
import sys
import json
from datetime import datetime, timedelta

class JoyTrackerAPITester:
    def __init__(self, base_url="https://joytracker.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_login = f"test_user_{datetime.now().strftime('%H%M%S')}"
        self.test_password = "TestPass123!"
        self.test_hint = "My favorite color"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        if data:
            print(f"   Data: {json.dumps(data, indent=2)}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health endpoints"""
        print("\n=== HEALTH CHECK TESTS ===")
        self.run_test("API Root", "GET", "", 200)
        self.run_test("Health Check", "GET", "health", 200)

    def test_user_registration(self):
        """Test user registration"""
        print("\n=== USER REGISTRATION TESTS ===")
        
        # Test successful registration
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "login": self.test_login,
                "password": self.test_password,
                "password_hint": self.test_hint
            }
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   Token received: {self.token[:20]}...")
            print(f"   User ID: {self.user_id}")
        
        # Test duplicate registration
        self.run_test(
            "Duplicate Registration",
            "POST",
            "auth/register",
            400,
            data={
                "login": self.test_login,
                "password": self.test_password,
                "password_hint": self.test_hint
            }
        )

    def test_user_login(self):
        """Test user login"""
        print("\n=== USER LOGIN TESTS ===")
        
        # Test successful login
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={
                "login": self.test_login,
                "password": self.test_password
            }
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   New token: {self.token[:20]}...")
        
        # Test invalid login
        self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={
                "login": self.test_login,
                "password": "wrong_password"
            }
        )

    def test_password_recovery(self):
        """Test password hint and reset"""
        print("\n=== PASSWORD RECOVERY TESTS ===")
        
        # Test password hint
        success, response = self.run_test(
            "Get Password Hint",
            "POST",
            "auth/password-hint",
            200,
            data={"login": self.test_user_login}
        )
        
        if success and response.get('hint') == self.test_hint:
            print(f"   Hint matches: {response['hint']}")
        
        # Test password reset
        new_password = "NewPass456!"
        success, response = self.run_test(
            "Reset Password",
            "POST",
            "auth/reset-password",
            200,
            data={
                "login": self.test_login,
                "new_password": new_password
            }
        )
        
        if success:
            # Test login with new password
            success, response = self.run_test(
                "Login with New Password",
                "POST",
                "auth/login",
                200,
                data={
                    "login": self.test_login,
                    "password": new_password
                }
            )
            
            if success and 'access_token' in response:
                self.token = response['access_token']

    def test_user_profile(self):
        """Test user profile endpoint"""
        print("\n=== USER PROFILE TESTS ===")
        
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "auth/me",
            200
        )
        
        if success:
            print(f"   User login: {response.get('login')}")
            print(f"   User ID: {response.get('id')}")

    def test_assessment_creation(self):
        """Test assessment creation"""
        print("\n=== ASSESSMENT TESTS ===")
        
        # Test assessment creation
        assessment_data = {
            "harmonious_states": ["Выспанность", "Интерес; Любопытство", "Бодрость; Энергичность"],
            "disharmonious_states": ["Усталость; Сонливость; Вялость", "Скука"],
            "reflection": "Сегодня чувствую себя хорошо, но немного устал",
            "decision_type": "simple_task",
            "decision_text": "Пойти спать пораньше"
        }
        
        success, response = self.run_test(
            "Create Assessment",
            "POST",
            "assessments",
            200,
            data=assessment_data
        )
        
        if success:
            assessment_id = response.get('id')
            print(f"   Assessment ID: {assessment_id}")
            
            # Test getting assessments
            self.run_test(
                "Get All Assessments",
                "GET",
                "assessments",
                200
            )

    def test_happiness_score(self):
        """Test happiness score calculation"""
        print("\n=== HAPPINESS SCORE TESTS ===")
        
        # Test different period types
        periods = ['week', 'month', 'quarter', 'half_year', 'year']
        
        for period in periods:
            success, response = self.run_test(
                f"Happiness Score - {period}",
                "POST",
                "happiness-score",
                200,
                data={"period_type": period}
            )
            
            if success:
                print(f"   Score: {response.get('score')}")
                print(f"   Has data: {response.get('has_data')}")
                print(f"   Harmonious: {response.get('total_harmonious')}")
                print(f"   Disharmonious: {response.get('total_disharmonious')}")
        
        # Test custom period
        start_date = (datetime.now() - timedelta(days=7)).isoformat()
        end_date = datetime.now().isoformat()
        
        self.run_test(
            "Happiness Score - Custom Period",
            "POST",
            "happiness-score",
            200,
            data={
                "period_type": "custom",
                "start_date": start_date,
                "end_date": end_date
            }
        )

    def test_unauthorized_access(self):
        """Test unauthorized access"""
        print("\n=== UNAUTHORIZED ACCESS TESTS ===")
        
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        self.run_test(
            "Unauthorized Profile Access",
            "GET",
            "auth/me",
            401
        )
        
        self.run_test(
            "Unauthorized Assessment Creation",
            "POST",
            "assessments",
            401,
            data={"harmonious_states": ["test"]}
        )
        
        # Restore token
        self.token = original_token

def main():
    print("🚀 Starting JoyTracker API Tests")
    print("=" * 50)
    
    tester = JoyTrackerAPITester()
    
    try:
        # Run all tests
        tester.test_health_check()
        tester.test_user_registration()
        tester.test_user_login()
        tester.test_password_recovery()
        tester.test_user_profile()
        tester.test_assessment_creation()
        tester.test_happiness_score()
        tester.test_unauthorized_access()
        
    except Exception as e:
        print(f"💥 Test suite failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 FINAL RESULTS")
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    success_rate = (tester.tests_passed/tester.tests_run)*100 if tester.tests_run > 0 else 0
    print(f"Success rate: {success_rate:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"❌ {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())