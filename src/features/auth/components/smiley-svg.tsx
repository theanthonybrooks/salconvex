interface SmileySvgProps {
  className?: string
  width?: string
  stroke?: string
  strokeWidth?: string
  fill?: string
  children?: React.ReactNode
}

const SmileySvg = (props: SmileySvgProps) => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 350.6 350.6'
      {...props}>
      <g data-name='Layer 1'>
        <g>
          <path
            fill='#f9f995'
            d='M175.3,347.6C80.29,347.6,3,270.3,3,175.3S80.29,3,175.3,3s172.3,77.29,172.3,172.3-77.29,172.3-172.3,172.3Z'
          />
          <path d='M175.3,6c45.22,0,87.74,17.61,119.71,49.59,31.98,31.98,49.59,74.49,49.59,119.71s-17.61,87.74-49.59,119.71c-31.98,31.98-74.49,49.59-119.71,49.59s-87.74-17.61-119.71-49.59c-31.98-31.98-49.59-74.49-49.59-119.71S23.61,87.56,55.59,55.59C87.56,23.61,130.08,6,175.3,6M175.3,0C78.48,0,0,78.48,0,175.3s78.48,175.3,175.3,175.3,175.3-78.48,175.3-175.3S272.11,0,175.3,0h0Z' />
          <path d='M195.77,150.82c-.48,0-.96-.06-1.44-.18-3.22-.79-5.18-4.05-4.39-7.26.03-.14.07-.33.12-.56,4.08-19.85,19.17-29.37,31.1-33.86,3.88-1.46,24.23-8.11,43.66,4.5,14.57,9.46,17.51,19.04,19.09,24.18.97,3.17-.79,6.56-3.96,7.53-3.17.98-6.51-.77-7.49-3.94l-.02-.07c-1.29-4.2-3.24-10.56-14.15-17.64-14.58-9.47-29.96-4.44-32.89-3.33-19.97,7.52-22.68,20.71-23.58,25.05-.09.42-.16.77-.22,1.02-.67,2.73-3.12,4.56-5.82,4.56Z' />
          <path d='M150.95,150.82c.48,0,.96-.06,1.44-.18,3.22-.79,5.18-4.05,4.39-7.26-.03-.14-.07-.33-.12-.56-4.08-19.85-19.17-29.37-31.1-33.86-3.88-1.46-24.23-8.11-43.66,4.5-14.57,9.46-17.51,19.04-19.09,24.18-.97,3.17.79,6.56,3.96,7.53,3.17.98,6.51-.77,7.49-3.94l.02-.07c1.29-4.2,3.24-10.56,14.15-17.64,14.58-9.47,29.96-4.44,32.89-3.33,19.97,7.52,22.68,20.71,23.58,25.05.09.42.16.77.22,1.02.67,2.73,3.12,4.56,5.82,4.56Z' />
          <circle fill='rgb(252 165 165)' cx='42.54' cy='172.19' r='20.01' />
          <circle fill='rgb(252 165 165)' cx='308.79' cy='172.19' r='20.01' />
        </g>
      </g>
    </svg>
  )
}

export default SmileySvg
