import React, { useState, useCallback, useEffect } from 'react'
import Button from '../components/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card'
import Slider from '../components/Slider'
import Checkbox from '../components/Checkbox'
import Input from '../components/Input'
import Label from '../components/Label'
import Badge from '../components/Badge'
import Toast from '../components/Toast'

import { useToast } from '../hooks/useToast'
import { Copy, RefreshCw, Shield, CheckCircle, Download, Info, Eye, EyeOff, Share2 } from 'lucide-react'

export default function PasswordGenerator() {

  const { toasts, showToast, hideToast } = useToast()
  
  const [password, setPassword] = useState('')
  const [length, setLength] = useState([16])
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [showPassword, setShowPassword] = useState(true)
  const [strengthDetails, setStrengthDetails] = useState(null)

  useEffect(() => {
    // SEO Meta Tags
    document.title = 'مولد كلمات مرور قوية | آمن وسريع ومجاني'
    
    const setMetaTag = (attr, key, content) => {
      let element = document.querySelector(`meta[${attr}="${key}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attr, key)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content)
    }

    setMetaTag('name', 'description', 'أنشئ كلمات مرور قوية وآمنة في ثوانٍ. مولد كلمات مرور مجاني يدعم الأحرف الكبيرة والصغيرة والأرقام والرموز مع خيارات تخصيص متقدمة.')
    setMetaTag('name', 'keywords', 'مولد كلمات مرور, كلمة مرور قوية, إنشاء كلمة سر, كلمة مرور عشوائية, أمان, حماية, password generator arabic, مولد باسورد')
    setMetaTag('name', 'author', 'Password Generator')
    
    // Open Graph / Facebook
    setMetaTag('property', 'og:type', 'website')
    setMetaTag('property', 'og:title', 'مولد كلمات مرور قوية | آمن وسريع')
    setMetaTag('property', 'og:description', 'أنشئ كلمات مرور عشوائية وآمنة في ثوانٍ.')
    setMetaTag('property', 'og:url', window.location.href)
    
    // Twitter
    setMetaTag('name', 'twitter:card', 'summary_large_image')
    setMetaTag('name', 'twitter:title', 'مولد كلمات مرور قوية | آمن وسريع')
    setMetaTag('name', 'twitter:description', 'أنشئ كلمات مرور عشوائية وآمنة في ثوانٍ.')

    // Set page language
    document.documentElement.lang = 'ar'
  }, [])

  const generatePassword = useCallback(() => {
    setIsGenerating(true)
    
    // تعريف مجموعات الأحرف
    const charSets = {
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    }

    // بناء مجموعة الأحرف المتاحة
    let availableChars = ''
    const selectedSets = []
    
    Object.keys(options).forEach(key => {
      if (options[key]) {
        availableChars += charSets[key]
        selectedSets.push(charSets[key])
      }
    })

    if (availableChars === '') {
      setPassword('يرجى اختيار نوع واحد على الأقل من الأحرف')
      setIsGenerating(false)
      return
    }

    // توليد كلمة المرور
    let newPassword = ''
    const passwordLength = length[0]

    // ضمان وجود حرف واحد على الأقل من كل نوع مختار
    selectedSets.forEach(set => {
      const randomIndex = Math.floor(Math.random() * set.length)
      newPassword += set[randomIndex]
    })

    // ملء باقي الطول عشوائياً
    for (let i = newPassword.length; i < passwordLength; i++) {
      const randomIndex = Math.floor(Math.random() * availableChars.length)
      newPassword += availableChars[randomIndex]
    }

    // خلط كلمة المرور
    newPassword = newPassword.split('').sort(() => Math.random() - 0.5).join('')

    setTimeout(() => {
      setPassword(newPassword)
      setIsGenerating(false)
      showToast('تم توليد كلمة مرور جديدة!', 'success')
    }, 500)
  }, [length, options])

  const copyToClipboard = async () => {
    if (!password || password === 'يرجى اختيار نوع واحد على الأقل من الأحرف') {
      showToast('لا توجد كلمة مرور للنسخ', 'error')
      return
    }
    
    try {
      await navigator.clipboard.writeText(password)
      showToast('تم نسخ كلمة المرور بنجاح!', 'success')
    } catch (err) {
      // Fallback للمتصفحات القديمة
      try {
        const textArea = document.createElement('textarea')
        textArea.value = password
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        showToast('تم نسخ كلمة المرور بنجاح!', 'success')
      } catch (fallbackErr) {
        showToast('فشل في نسخ كلمة المرور', 'error')
      }
    }
  }

  const getPasswordStrength = () => {
    if (!password || password === 'يرجى اختيار نوع واحد على الأقل من الأحرف') {
      return { level: 0, text: '', color: '', percentage: 0, details: null }
    }
    
    let score = 0
    const details = {
      length: password.length,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /[0-9]/.test(password),
      hasSymbols: /[^A-Za-z0-9]/.test(password),
      entropy: 0
    }
    
    // حساب النقاط
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (password.length >= 16) score += 1
    if (details.hasUppercase) score += 1
    if (details.hasLowercase) score += 1
    if (details.hasNumbers) score += 1
    if (details.hasSymbols) score += 1
    
    // حساب الإنتروبيا
    let charsetSize = 0
    if (details.hasLowercase) charsetSize += 26
    if (details.hasUppercase) charsetSize += 26
    if (details.hasNumbers) charsetSize += 10
    if (details.hasSymbols) charsetSize += 32
    
    details.entropy = Math.log2(Math.pow(charsetSize, password.length))
    
    if (score <= 3) return { 
      level: 1, 
      text: 'ضعيفة', 
      color: 'bg-red-500', 
      percentage: 25,
      details,
      advice: 'استخدم كلمة مرور أطول مع أنواع مختلفة من الأحرف'
    }
    if (score <= 5) return { 
      level: 2, 
      text: 'متوسطة', 
      color: 'bg-orange-500', 
      percentage: 50,
      details,
      advice: 'أضف المزيد من الأحرف والرموز لتحسين الأمان'
    }
    if (score <= 6) return { 
      level: 3, 
      text: 'قوية', 
      color: 'bg-blue-500', 
      percentage: 75,
      details,
      advice: 'كلمة مرور جيدة، يمكن تحسينها بإضافة المزيد من الأحرف'
    }
    return { 
      level: 4, 
      text: 'قوية جداً', 
      color: 'bg-teal-500', 
      percentage: 100,
      details,
      advice: 'كلمة مرور ممتازة وآمنة جداً'
    }
  }

  const strength = getPasswordStrength()
  
  // دالة حفظ كلمة المرور كملف TXT
  const downloadPassword = () => {
    if (!password || password === 'يرجى اختيار نوع واحد على الأقل من الأحرف') {
      showToast('لا توجد كلمة مرور للحفظ', 'error')
      return
    }
    
    try {
      const timestamp = new Date().toLocaleString('ar-SA')
      const content = `كلمة المرور: ${password}\nتاريخ الإنشاء: ${timestamp}\nطول كلمة المرور: ${password.length} حرف\nقوة كلمة المرور: ${strength.text}\n\nتنبيه: احتفظ بهذه الكلمة في مكان آمن ولا تشاركها مع أحد.`
      
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `password-${Date.now()}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      showToast('تم حفظ كلمة المرور بنجاح!', 'download')
    } catch (error) {
      showToast('فشل في حفظ كلمة المرور', 'error')
    }
  }
  
  // دالة تبديل إظهار/إخفاء كلمة المرور
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300" dir="rtl" style={{backgroundColor: 'var(--background)'}}>
      {/* Header */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8" style={{color: 'var(--foreground)'}}>
        <div className="text-center mb-8 sm:mb-10 lg:mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 font-cairo">
            مولد كلمات مرور قوية
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            أنشئ كلمات مرور عشوائية وآمنة في ثوانٍ
          </p>
        </div>

        {/* Main Card */}
        <div className="max-w-2xl mx-auto animate-slide-up px-2 sm:px-0">
          <Card className="backdrop-blur-sm border-0 shadow-2xl animate-fade-in" style={{backgroundColor: 'var(--card)', color: 'var(--card-foreground)'}}>
            <CardHeader className="pb-4 sm:pb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="text-xl sm:text-2xl font-bold text-center">إعدادات كلمة المرور</CardTitle>
              <CardDescription className="text-blue-100 text-center">
                خصص كلمة المرور حسب احتياجاتك
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Length Slider */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="length" className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">طول كلمة المرور</Label>
                  <Badge variant="secondary" className="text-base sm:text-lg px-2 sm:px-3 py-1">
                    {length[0]} حرف
                  </Badge>
                </div>
                <Slider
                  id="length"
                  value={length}
                  onValueChange={setLength}
                  max={32}
                  min={8}
                  step={1}
                  className="w-full"
                  aria-label={`طول كلمة المرور: ${length[0]} حرف`}
                  aria-valuemin={8}
                  aria-valuemax={32}
                  aria-valuenow={length[0]}
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>8</span>
                  <span>32</span>
                </div>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6" role="group" aria-labelledby="character-options">
                <h3 id="character-options" className="sr-only">خيارات أنواع الأحرف</h3>
                {[
                  { key: 'uppercase', label: 'أحرف كبيرة (A-Z)', example: 'ABC', desc: 'تضمين الأحرف الكبيرة في كلمة المرور' },
                  { key: 'lowercase', label: 'أحرف صغيرة (a-z)', example: 'abc', desc: 'تضمين الأحرف الصغيرة في كلمة المرور' },
                  { key: 'numbers', label: 'أرقام (0-9)', example: '123', desc: 'تضمين الأرقام في كلمة المرور' },
                  { key: 'symbols', label: 'رموز (!@#$)', example: '!@#', desc: 'تضمين الرموز الخاصة في كلمة المرور' }
                ].map((option) => (
                  <div 
                    key={option.key}
                    className="flex items-center space-x-3 space-x-reverse p-4 rounded-lg bg-gray-50 dark:bg-slate-600 hover:bg-gray-100 dark:hover:bg-slate-500 transition-colors"
                  >
                    <Checkbox
                      id={option.key}
                      checked={options[option.key]}
                      onCheckedChange={(checked) =>
                        setOptions(prev => ({ ...prev, [option.key]: checked }))
                      }
                      className="w-5 h-5"
                      aria-describedby={`${option.key}-desc`}
                    />
                    <div className="flex-1">
                      <Label htmlFor={option.key} className="font-medium text-gray-800 dark:text-gray-200 cursor-pointer">
                        {option.label}
                      </Label>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">{option.example}</div>
                      <span id={`${option.key}-desc`} className="sr-only">{option.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Generate Button */}
              <Button 
                onClick={generatePassword}
                disabled={isGenerating}
                className="w-full py-3 sm:py-4 text-base sm:text-lg font-semibold focus:ring-4 transition-all duration-300 transform hover:scale-105 hover-lift animate-scale-in"
                style={{backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', '--tw-ring-color': 'var(--primary)'}}
                size="lg"
                aria-label={isGenerating ? 'جاري توليد كلمة مرور جديدة' : 'توليد كلمة مرور جديدة'}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="ml-2 w-5 h-5 animate-spin" aria-hidden="true" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <RefreshCw className="ml-2 w-5 h-5" aria-hidden="true" />
                    توليد كلمة مرور
                  </>
                )}
              </Button>

              {/* Generated Password Display */}
              {password && (
                 <div className="space-y-3 sm:space-y-4 animate-slide-up">
                   <Label className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">كلمة المرور المُولدة</Label>
                   
                   <div className="relative" role="group" aria-labelledby="password-display">
                     <Label id="password-display" className="sr-only">كلمة المرور المولدة</Label>
                     <Input
                       value={showPassword ? password : '•'.repeat(password.length)}
                       readOnly
                       className="font-mono text-sm sm:text-base lg:text-lg p-3 sm:p-4 pr-20 sm:pr-28 bg-gray-50 dark:bg-slate-700 border-2 focus:border-blue-500 transition-all duration-300 hover-scale animate-fade-in"
                       dir="ltr"
                       aria-label="كلمة المرور المولدة"
                       aria-describedby="password-actions"
                     />
                     <div id="password-actions" className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 flex gap-0.5 sm:gap-1" role="toolbar" aria-label="إجراءات كلمة المرور">
                       <Button
                         onClick={togglePasswordVisibility}
                         variant="ghost"
                         size="sm"
                         className="focus:ring-2 transition-all duration-200 p-1 sm:p-2 hover:scale-110 hover-lift"
                         style={{'--tw-ring-color': 'var(--primary)'}}
                         aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                         title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                       >
                         {showPassword ? (
                           <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" aria-hidden="true" />
                         ) : (
                           <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" aria-hidden="true" />
                         )}
                       </Button>
                       <Button
                         onClick={downloadPassword}
                         variant="ghost"
                         size="sm"
                         className="focus:ring-2 transition-all duration-200 p-1 sm:p-2 hover:scale-110 hover-lift"
                         style={{'--tw-ring-color': 'var(--primary)'}}
                         aria-label="حفظ كلمة المرور كملف نصي"
                         title="حفظ كلمة المرور كملف نصي"
                       >
                         <Download className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" aria-hidden="true" />
                       </Button>
                       <Button
                         onClick={copyToClipboard}
                         variant="ghost"
                         size="sm"
                         className="focus:ring-2 transition-all duration-200 p-1 sm:p-2 hover:scale-110 hover-lift animate-bounce"
                         style={{'--tw-ring-color': 'var(--primary)'}}
                         aria-label="نسخ كلمة المرور إلى الحافظة"
                         title="نسخ كلمة المرور إلى الحافظة"
                       >
                         <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" aria-hidden="true" />
                       </Button>
                     </div>
                   </div>

                  {/* Password Strength */}
                   {password && password !== 'يرجى اختيار نوع واحد على الأقل من الأحرف' && (
                     <div className="space-y-2 sm:space-y-3 animate-slide-up" role="region" aria-labelledby="strength-indicator">
                       <div className="flex justify-between items-center">
                         <span id="strength-indicator" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">قوة كلمة المرور</span>
                         <Badge variant="outline" className={`${strength.color} text-white border-0 text-xs sm:text-sm px-1 sm:px-2 py-0.5 sm:py-1`} aria-label={`مستوى القوة: ${strength.text}`}>
                           {strength.text}
                         </Badge>
                       </div>
                       <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2 sm:h-3 animate-scale-in" role="progressbar" aria-valuenow={strength.percentage} aria-valuemin={0} aria-valuemax={100} aria-label={`قوة كلمة المرور: ${strength.percentage}%`}>
                         <div
                           className={`h-2 sm:h-3 rounded-full ${strength.color} transition-all duration-700 ease-out animate-pulse`}
                           style={{ width: `${strength.percentage}%` }}
                         />
                       </div>
                       <div className="text-xs text-gray-600 dark:text-gray-400 px-1" aria-live="polite">
                         {strength.advice}
                       </div>
                       {strength.details && (
                         <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs px-1" role="list" aria-label="تفاصيل أنواع الأحرف المستخدمة">
                           <div className="flex items-center gap-1" role="listitem">
                             <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${strength.details.hasUppercase ? 'bg-green-500' : 'bg-gray-300'}`} aria-hidden="true" />
                             <span className="text-gray-600 dark:text-gray-400 text-xs">أحرف كبيرة</span>
                             <span className="sr-only">{strength.details.hasUppercase ? 'مُستخدمة' : 'غير مُستخدمة'}</span>
                           </div>
                           <div className="flex items-center gap-1" role="listitem">
                             <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${strength.details.hasLowercase ? 'bg-green-500' : 'bg-gray-300'}`} aria-hidden="true" />
                             <span className="text-gray-600 dark:text-gray-400 text-xs">أحرف صغيرة</span>
                             <span className="sr-only">{strength.details.hasLowercase ? 'مُستخدمة' : 'غير مُستخدمة'}</span>
                           </div>
                           <div className="flex items-center gap-1" role="listitem">
                             <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${strength.details.hasNumbers ? 'bg-green-500' : 'bg-gray-300'}`} aria-hidden="true" />
                             <span className="text-gray-600 dark:text-gray-400 text-xs">أرقام</span>
                             <span className="sr-only">{strength.details.hasNumbers ? 'مُستخدمة' : 'غير مُستخدمة'}</span>
                           </div>
                           <div className="flex items-center gap-1" role="listitem">
                             <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${strength.details.hasSymbols ? 'bg-green-500' : 'bg-gray-300'}`} aria-hidden="true" />
                             <span className="text-gray-600 dark:text-gray-400 text-xs">رموز</span>
                             <span className="sr-only">{strength.details.hasSymbols ? 'مُستخدمة' : 'غير مُستخدمة'}</span>
                           </div>
                         </div>
                       )}
                     </div>
                   )}


                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Share Section */}
        <div className="max-w-2xl mx-auto mt-8 sm:mt-12 animate-fade-in px-2 sm:px-0">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-xl" role="region" aria-labelledby="share-section">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle id="share-section" className="text-lg sm:text-xl text-center font-bold text-gray-800 dark:text-gray-100">
                هل أعجبتك الأداة؟ شاركها!
              </CardTitle>
              <CardDescription className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-300">
                ساعد أصدقاءك على تعزيز أمانهم الرقمي.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row flex-wrap justify-center gap-2 sm:gap-4 px-4 sm:px-6" role="toolbar" aria-label="أزرار مشاركة الأداة">
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center justify-center gap-2 text-sm focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 w-full sm:w-auto transition-all duration-200 hover:scale-105 hover-lift" 
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('جربت مولد كلمات المرور القوية هذا، أداة رائعة لإنشاء كلمات سر آمنة!')}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                aria-label="مشاركة الأداة على تويتر"
                title="مشاركة الأداة على تويتر"
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-[#1DA1F2]" aria-hidden="true" />
                <span>تويتر</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center justify-center gap-2 text-sm focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 w-full sm:w-auto" 
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                aria-label="مشاركة الأداة على فيسبوك"
                title="مشاركة الأداة على فيسبوك"
              >
                <Info className="w-4 h-4 sm:w-5 sm:h-5 text-[#1877F2]" aria-hidden="true" />
                <span>فيسبوك</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="flex items-center justify-center gap-2 text-sm focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600 w-full sm:w-auto" 
                onClick={async () => {
                  if (navigator.share) {
                    await navigator.share({
                      title: 'مولد كلمات مرور قوية',
                      text: 'أداة رائعة لإنشاء كلمات سر آمنة وقوية.',
                      url: window.location.href,
                    })
                  } else {
                    await navigator.clipboard.writeText(window.location.href)
                    alert('تم نسخ الرابط! يمكنك مشاركته الآن.')
                  }
                }}
                aria-label="مشاركة رابط الأداة"
                title="مشاركة رابط الأداة"
              >
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" aria-hidden="true" />
                <span>مشاركة</span>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Security Tips */}
        <div className="max-w-4xl mx-auto mt-8 sm:mt-12 animate-slide-down px-2 sm:px-0">
          <Card className="bg-blue-50 dark:bg-slate-700 border-blue-200 dark:border-slate-600" role="region" aria-labelledby="security-tips">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle id="security-tips" className="text-lg sm:text-xl text-blue-900 dark:text-blue-300 text-center">
                نصائح للأمان
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 text-center" role="list" aria-label="قائمة نصائح الأمان لكلمات المرور">
                <div className="space-y-2 sm:space-y-3 transition-all duration-300 hover:scale-105" role="listitem">
                  <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 mx-auto" aria-hidden="true" />
                  <h3 className="font-semibold text-sm sm:text-base text-blue-900 dark:text-blue-300">استخدم كلمات مرور فريدة</h3>
                  <p className="text-blue-700 dark:text-blue-200 text-xs sm:text-sm">لا تكرر نفس كلمة المرور في مواقع متعددة</p>
                </div>
                <div className="space-y-2 sm:space-y-3 transition-all duration-300 hover:scale-105" role="listitem">
                  <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 mx-auto" aria-hidden="true" />
                  <h3 className="font-semibold text-sm sm:text-base text-blue-900 dark:text-blue-300">غيّر كلمات المرور دورياً</h3>
                  <p className="text-blue-700 dark:text-blue-200 text-xs sm:text-sm">احرص على تغيير كلمات المرور كل 3-6 أشهر</p>
                </div>
                <div className="space-y-2 sm:space-y-3 sm:col-span-2 md:col-span-1 transition-all duration-300 hover:scale-105" role="listitem">
                  <Copy className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 mx-auto" aria-hidden="true" />
                  <h3 className="font-semibold text-sm sm:text-base text-blue-900 dark:text-blue-300">احفظها بأمان</h3>
                  <p className="text-blue-700 dark:text-blue-200 text-xs sm:text-sm">استخدم مدير كلمات مرور موثوق</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 sm:mt-16 py-6 sm:py-8 border-t border-gray-200 dark:border-gray-700 animate-fade-in px-4 sm:px-0" role="contentinfo" aria-label="معلومات الموقع">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 font-cairo leading-relaxed" role="heading" aria-level="2">
            © 2025 مولد كلمات مرور قوية - جميع الحقوق محفوظة
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 sm:mt-2 leading-relaxed">
            مُطوّر بتقنيات حديثة - آمن وسريع ومجاني
          </p>
        </footer>
        
        {/* Toast Notifications */}
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            isVisible={toast.isVisible}
            onClose={() => hideToast(toast.id)}
            duration={toast.duration}
          />
        ))}
      </div>
    </div>
  )
}