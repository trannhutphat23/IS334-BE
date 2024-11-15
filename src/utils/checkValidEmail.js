const isInvalidEmail = async (email) => {
    try {
        const res = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=644f68f34bcd4959b0d4405b68151662&email=${email}`)
        if (!res) {
            throw new Error('Failed to fetch email validation API')
        }
        const data = await res.json();
        if (data.is_disposable_email.value || !data.is_valid_format.value) return true

        return false
    } catch (e) {
        console.error('Fetch error:', error);
    }
}

module.exports = isInvalidEmail