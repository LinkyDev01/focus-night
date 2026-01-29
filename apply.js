let currentStep = 1;

function showStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });

    // Show current step
    document.getElementById(`step${stepNumber}`).classList.add('active');

    // Update progress indicators
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 < stepNumber) {
            step.classList.add('completed');
        } else if (index + 1 === stepNumber) {
            step.classList.add('active');
        }
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep(stepNumber) {
    const step = document.getElementById(`step${stepNumber}`);
    const requiredInputs = step.querySelectorAll('[required]');

    for (let input of requiredInputs) {
        // 날짜 체크박스 검증 (최소 1개 이상 선택)
        if (input.name === "dates" && input.type === "checkbox") {
            const dateCheckboxes = step.querySelectorAll('input[name="dates"]');
            const isDateSelected = Array.from(dateCheckboxes).some(checkbox => checkbox.checked);
            if (!isDateSelected) {
                alert('참여 희망 날짜를 최소 1개 이상 선택해주세요.');
                return false;
            }
            continue; // 다음 input으로
        }

        // 개인정보 동의 체크박스
        if (input.type === 'checkbox' && input.name === 'privacy_agree') {
            if (!input.checked) {
                alert('개인정보 수집 및 이용에 동의해주세요.');
                input.focus();
                return false;
            }
            continue;
        }

        // 나이 검증
        if (input.name === "age") {
            const age = Number(input.value);
            if (isNaN(age) || age < 19 || age > 40) {
                alert('만 19세 ~ 40세만 신청이 가능합니다.');
                input.focus();
                return false;
            }
            continue;
        }

        // 성별 선택 체크 (라디오 버튼)
        if (input.name === "gender" && input.type === "radio") {
            const genderRadios = step.querySelectorAll('input[name="gender"]');
            const isGenderSelected = Array.from(genderRadios).some(radio => radio.checked);
            if (!isGenderSelected) {
                alert('성별을 선택해주세요.');
                return false;
            }
            continue;
        }

        // 일반 입력은 value로 체크
        if (!input.value.trim()) {
            alert('필수 항목을 모두 입력해주세요.');
            input.focus();
            return false;
        }
    }
    return true;
}

// 선택된 날짜들 가져오기
function getSelectedDates() {
    const dateCheckboxes = document.querySelectorAll('input[name="dates"]:checked');
    return Array.from(dateCheckboxes).map(checkbox => checkbox.value).join(', ');
}

// Step navigation
document.getElementById('nextStep1').addEventListener('click', () => {
    if (validateStep(1)) {
        currentStep = 2;
        showStep(currentStep);
    }
});

document.getElementById('prevStep2').addEventListener('click', () => {
    currentStep = 1;
    showStep(currentStep);
});

document.getElementById('nextStep2').addEventListener('click', () => {
    currentStep = 3;
    showStep(currentStep);
});

document.getElementById('prevStep3').addEventListener('click', () => {
    currentStep = 2;
    showStep(currentStep);
});

// 글자 수 카운터
const introTextarea = document.querySelector('textarea[name="introduction"]');
const charCountSpan = document.getElementById('charCount');

if (introTextarea && charCountSpan) {
    introTextarea.addEventListener('input', function() {
        charCountSpan.textContent = this.value.length;
    });
}

// 연락처 자동 하이픈 입력
const phoneInput = document.querySelector('input[name="phone"]');

if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 남기기
        let formattedValue = '';

        if (value.length <= 3) {
            formattedValue = value;
        } else if (value.length <= 7) {
            formattedValue = value.slice(0, 3) + '-' + value.slice(3);
        } else if (value.length <= 11) {
            formattedValue = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7);
        } else {
            formattedValue = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
        }

        e.target.value = formattedValue;
    });
}

// 폼 제출
document.getElementById('applicationForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!validateStep(3)) return;

    // 로딩 오버레이 표시
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = 'flex';

    const payload = {
        name: this.name.value,
        dates: getSelectedDates(),
        gender: this.gender.value,
        age: this.age.value,
        phone: this.phone.value,
        introduction: this.introduction.value,
        job: this.job.value || '',
        instagram: this.instagram.value || '',
        source: this.source.value || '',
        referrer: this.referrer.value || '',
        privacy_agree: this.privacy_agree.checked,
        submitted_at: new Date().toISOString()
    };

    try {
        await fetch(
            'https://script.google.com/macros/s/AKfycbxsBxKTSXZMyblqUYs33uOY1PtDbQCizq5a9EW6KDXOKyjYbDoHkvMyC99MYQhYFVkw/exec',
            {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }
        );

        alert('신청이 완료되었습니다! 입금 확인 후 개별 연락드리겠습니다.');
        window.location.replace('/');
    } catch (err) {
        console.error('Error:', err);
        alert('전송 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
        // 로딩 오버레이 숨김
        loadingOverlay.style.display = 'none';
    }
});
